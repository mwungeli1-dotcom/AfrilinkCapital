const SupplierApplication = require("./models/SupplierApplication");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Request = require("./models/Request");
const User = require("./models/User");
const Quotation = require("./models/Quotation");
const Product = require("./models/Product");
const SupplierRfq = require("./models/SupplierRfq");
const Notification = require("./models/Notification");
const SavedProduct = require("./models/SavedProduct");
const VisitorSession = require("./models/VisitorSession");
const PRODUCT_CATEGORIES = require("./config/productCategories");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_NOW";

function removePassword(user) {
  const cleanUser = user.toObject ? user.toObject() : user;
  delete cleanUser.password;
  return cleanUser;
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await User.findById(decoded.id).select("role accountStatus");
    if (!user) return res.status(401).json({ success: false, message: "Account no longer exists" });
    if (user.accountStatus === "suspended") return res.status(403).json({ success: false, message: "This account has been suspended. Contact Afrilink support." });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify account" });
  }
}

async function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return next();
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Invalid authorization header" });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  try {
    const user = await User.findById(decoded.id).select("role accountStatus");
    if (!user) return res.status(401).json({ success: false, message: "Account no longer exists" });
    if (user.accountStatus === "suspended") return res.status(403).json({ success: false, message: "This account has been suspended. Contact Afrilink support." });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify account" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || !["admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

async function notifyUser(userId, notification) {
  if (!userId) return;
  await Notification.create({ userId, ...notification }).catch((error) => {
    console.error("Notification error:", error.message);
  });
}

async function notifyAdmins(notification) {
  const admins = await User.find({ role: { $in: ["admin", "super_admin"] } }).select("_id");
  if (admins.length) {
    await Notification.insertMany(admins.map((admin) => ({ userId: admin._id, ...notification }))).catch((error) => {
      console.error("Admin notification error:", error.message);
    });
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.get("/", (req, res) => {
  res.json({ message: "Afrilink Hub Backend Running 🚀" });
});

app.post("/analytics/heartbeat", optionalAuthMiddleware, async (req, res) => {
  try {
    const visitorId = String(req.body.visitorId || "").trim().slice(0, 100);
    const page = String(req.body.page || "/").trim().slice(0, 160);
    if (!visitorId) return res.status(400).json({ success: false, message: "Visitor session required" });
    await VisitorSession.findOneAndUpdate(
      { visitorId },
      { $set: { userId: req.user?.id || null, role: req.user?.role || "guest", page: page.startsWith("/") ? page : "/", lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update visitor presence" });
  }
});

app.get("/admin/online-visitors", authMiddleware, adminOnly, async (req, res) => {
  try {
    const activeSince = new Date(Date.now() - 90000);
    const sessions = await VisitorSession.find({ lastSeen: { $gte: activeSince } }).select("role page userId").lean();
    const pageCounts = sessions.reduce((counts, session) => {
      counts[session.page] = (counts[session.page] || 0) + 1;
      return counts;
    }, {});
    res.json({ success: true, presence: {
      total: sessions.length,
      signedIn: sessions.filter((session) => session.userId).length,
      guests: sessions.filter((session) => !session.userId).length,
      buyers: sessions.filter((session) => session.role === "buyer").length,
      suppliers: sessions.filter((session) => session.role === "supplier").length,
      pages: Object.entries(pageCounts).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      updatedAt: new Date(),
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load online visitors" });
  }
});

// REQUESTS
app.post("/requests", optionalAuthMiddleware, async (req, res) => {
  try {
    if (req.user?.role === "supplier") {
      return res.status(403).json({ success: false, message: "Supplier accounts cannot submit buyer quotation requests" });
    }
    const requiredFields = [
      "customerName",
      "phone",
      "deliveryLocation",
      "title",
      "description",
      "quantity",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !String(req.body[field] || "").trim()
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide your contact details and complete product requirements",
        missingFields,
      });
    }

    let linkedProduct = null;
    if (req.body.productId) {
      linkedProduct = await Product.findOne({
        _id: req.body.productId,
        isActive: { $ne: false },
        $or: [{ status: "Approved" }, { status: { $exists: false } }],
      });
      if (!linkedProduct) return res.status(400).json({ success: false, message: "Selected product is no longer available" });
    }

    const newRequest = new Request({
      userId: req.user?.id,
      productId: linkedProduct?._id,
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      deliveryLocation: req.body.deliveryLocation,
      title: req.body.title,
      country: req.body.country,
      quantity: req.body.quantity,
      description: req.body.description,
      status: "Received",
    });

    const savedRequest = await newRequest.save();
    if (linkedProduct) await Product.findByIdAndUpdate(linkedProduct._id, { $inc: { requestCount: 1 } });

    res.json({
      success: true,
      message: "Request saved successfully",
      request: savedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save request",
      error: error.message,
    });
  }
});

app.get("/requests", authMiddleware, adminOnly, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
});

app.get("/requests/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch request",
      error: error.message,
    });
  }
});

app.get("/my/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch your requests", error: error.message });
  }
});

app.get("/my/requests/:id", authMiddleware, async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, userId: req.user.id });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const quotations = await Quotation.find({
      requestId: request._id,
      status: { $in: ["Sent", "Accepted", "Rejected", "Expired"] },
    })
      .select("quotationNumber currency freightCost customsCost serviceFee totalAmount deliveryTime validityDays terms notes status paymentStatus amountPaid createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      request,
      quotations: quotations.map((quotation) => ({
        ...quotation.toObject(),
        balance: Math.max(quotation.totalAmount - quotation.amountPaid, 0),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch request details", error: error.message });
  }
});

app.put("/my/quotations/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!["Accepted", "Rejected"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Choose Accepted or Rejected" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation || quotation.status !== "Sent") {
      return res.status(404).json({ success: false, message: "Active quotation not found" });
    }

    const request = await Request.findOne({ _id: quotation.requestId, userId: req.user.id });
    if (!request) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    quotation.status = req.body.status;
    if (req.body.status === "Accepted") quotation.acceptedAt = new Date();
    if (req.body.status === "Rejected") quotation.rejectedAt = new Date();
    await quotation.save();

    request.status = req.body.status === "Accepted" ? "Awaiting Deposit" : "Reviewing";
    await request.save();

    await notifyAdmins({
      type: "response",
      title: `Buyer ${req.body.status.toLowerCase()} quotation`,
      message: `${request.customerName || "A buyer"} ${req.body.status.toLowerCase()} ${quotation.quotationNumber}.`,
      href: `/requests/${request._id}`,
    });

    res.json({ success: true, message: `Quotation ${req.body.status.toLowerCase()}`, status: quotation.status });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update quotation", error: error.message });
  }
});

app.put("/requests/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      {
        customerName: req.body.customerName,
        phone: req.body.phone,
        email: req.body.email,
        deliveryLocation: req.body.deliveryLocation,
        title: req.body.title,
        country: req.body.country,
        quantity: req.body.quantity,
        description: req.body.description,
        status: req.body.status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update request",
      error: error.message,
    });
  }
});

app.delete("/requests/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete request",
      error: error.message,
    });
  }
});

// PRODUCTS
function supplierOrAdmin(req, res, next) {
  if (!req.user || !["supplier", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Approved supplier access required" });
  }
  next();
}

function calculateProductPricing(rawPrice, rawCurrency) {
  const supplierPrice = Number(rawPrice);
  if (!Number.isFinite(supplierPrice) || supplierPrice <= 0) return null;
  const currency = ["USD", "ZMW"].includes(rawCurrency) ? rawCurrency : "USD";
  const markupPercent = 20;
  const publicPrice = Math.round(supplierPrice * (1 + markupPercent / 100) * 100) / 100;
  const price = `${currency} ${publicPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return { supplierPrice, publicPrice, markupPercent, currency, price };
}

function normalizeProductImages(rawImages, legacyImage = "") {
  const candidates = Array.isArray(rawImages) ? rawImages : legacyImage ? [legacyImage] : [];
  return [...new Set(candidates.map((item) => String(item || "").trim()).filter(Boolean))];
}

app.post("/products", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const requiredFields = ["name", "category", "description", "supplierPrice", "origin", "delivery"];
    const missingFields = requiredFields.filter((field) => !String(req.body[field] || "").trim());
    if (missingFields.length) {
      return res.status(400).json({ success: false, message: "Complete all required product details", missingFields });
    }
    if (!PRODUCT_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({ success: false, message: "Select a valid product category" });
    }
    const pricing = calculateProductPricing(req.body.supplierPrice, req.body.currency);
    if (!pricing) return res.status(400).json({ success: false, message: "Enter a valid supplier price greater than zero" });
    const images = normalizeProductImages(req.body.images, req.body.image);
    if (images.length > 4) return res.status(400).json({ success: false, message: "Upload no more than 4 product images" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      ...pricing,
      origin: req.body.origin,
      delivery: req.body.delivery,
      image: images[0] || "",
      images,
      video: req.body.video,
      supplierId: req.user.id,
      status: isAdmin ? "Approved" : "Pending",
      isActive: true,
    });

    res.json({
      success: true,
      message: isAdmin ? "Product published successfully" : "Product submitted for Afrilink review",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: { $ne: false },
      $or: [{ status: "Approved" }, { status: { $exists: false } }],
    }).select("-supplierId -supplierPrice -markupPercent").sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

app.get("/supplier/products", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const products = await Product.find({ supplierId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch supplier products", error: error.message });
  }
});

app.get("/admin/products", authMiddleware, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().populate("supplierId", "name email").sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
});

app.get("/manage/products/:id", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && product.supplierId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only manage your own products" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product", error: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: { $ne: false },
        $or: [{ status: "Approved" }, { status: { $exists: false } }],
      },
      { $inc: { views: 1 } },
      { new: true }
    ).select("-supplierId -supplierPrice -markupPercent");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

app.get("/saved-products", authMiddleware, async (req, res) => {
  try {
    const saved = await SavedProduct.find({ userId: req.user.id })
      .populate({
        path: "productId",
        match: { isActive: { $ne: false }, $or: [{ status: "Approved" }, { status: { $exists: false } }] },
        select: "name category description price publicPrice currency origin delivery image images views requestCount createdAt",
      })
      .sort({ createdAt: -1 });
    const available = saved.filter((item) => item.productId);
    res.json({ success: true, savedProducts: available, productIds: available.map((item) => item.productId._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch saved products", error: error.message });
  }
});

app.get("/saved-products/:productId/status", authMiddleware, async (req, res) => {
  try {
    const saved = await SavedProduct.exists({ userId: req.user.id, productId: req.params.productId });
    res.json({ success: true, saved: Boolean(saved) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check saved product", error: error.message });
  }
});

app.put("/saved-products/:productId", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      isActive: { $ne: false },
      $or: [{ status: "Approved" }, { status: { $exists: false } }],
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const existing = await SavedProduct.findOne({ userId: req.user.id, productId: product._id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, saved: false, message: "Product removed from saved items" });
    }
    await SavedProduct.create({ userId: req.user.id, productId: product._id });
    res.json({ success: true, saved: true, message: "Product saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update saved product", error: error.message });
  }
});

app.put("/products/:id", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && product.supplierId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit your own products" });
    }
    if (!PRODUCT_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({ success: false, message: "Select a valid product category" });
    }

    const pricing = calculateProductPricing(req.body.supplierPrice, req.body.currency || product.currency);
    if (!pricing) return res.status(400).json({ success: false, message: "Enter a valid supplier price greater than zero" });
    const images = normalizeProductImages(req.body.images, req.body.image);
    if (images.length > 4) return res.status(400).json({ success: false, message: "Upload no more than 4 product images" });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        ...pricing,
        delivery: req.body.delivery,
        origin: req.body.origin,
        description: req.body.description,
        image: images[0] || "",
        images,
        video: req.body.video,
        status: isAdmin ? (req.body.status || product.status) : "Pending",
        rejectionReason: isAdmin ? (req.body.rejectionReason || "") : "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

app.put("/products/:id/approval", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!["Approved", "Rejected", "Pending"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid product status" });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, rejectionReason: req.body.status === "Rejected" ? (req.body.rejectionReason || "Needs revision") : "" },
      { new: true, runValidators: true }
    ).populate("supplierId", "name email");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    await notifyUser(product.supplierId?._id, {
      type: "approval",
      title: `Product ${req.body.status.toLowerCase()}`,
      message: req.body.status === "Approved" ? `${product.name} is now live in the Afrilink catalogue.` : `${product.name} requires attention: ${product.rejectionReason || "Please contact Afrilink."}`,
      href: "/admin/products",
    });
    res.json({ success: true, message: `Product ${req.body.status.toLowerCase()}`, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to review product", error: error.message });
  }
});

app.delete("/products/:id", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && product.supplierId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own products" });
    }
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// AUTH
app.post("/register", async (req, res) => {
  let createdUser = null;
  try {
    const { name, password, accountType = "buyer" } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();
    const role = "buyer";

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Name, email, and a password of at least 6 characters are required" });
    }

    if (accountType === "supplier") {
      const supplierFields = ["companyName", "country", "contactPerson", "phone", "businessRegistration", "description"];
      const missingFields = supplierFields.filter((field) => !String(req.body[field] || "").trim());
      if (missingFields.length) {
        return res.status(400).json({ success: false, message: "Complete all required supplier application details", missingFields });
      }
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (accountType === "supplier") {
      await SupplierApplication.create({
        userId: createdUser._id,
        companyName: req.body.companyName,
        country: req.body.country,
        contactPerson: req.body.contactPerson,
        phone: req.body.phone,
        website: req.body.website,
        businessRegistration: req.body.businessRegistration,
        productCategories: Array.isArray(req.body.productCategories) ? req.body.productCategories : [],
        description: req.body.description,
        status: "Pending",
      });
    }

    res.json({
      success: true,
      message: accountType === "supplier" ? "Account created and supplier application submitted for review" : "User registered successfully",
      applicationStatus: accountType === "supplier" ? "Pending" : undefined,
      user: removePassword(createdUser),
    });
  } catch (error) {
    if (createdUser?._id) await User.findByIdAndDelete(createdUser._id).catch(() => {});
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({ success: false, message: "This account has been suspended. Contact Afrilink support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: removePassword(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// PROFILE
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load profile", error: error.message });
  }
});

app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone: String(req.body.phone || "").trim(),
        country: String(req.body.country || "").trim(),
        companyName: String(req.body.companyName || "").trim(),
        avatar: String(req.body.avatar || "").trim(),
      },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
});

app.put("/profile/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Current password and a new password of at least 8 characters are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change password", error: error.message });
  }
});

app.get("/admin/overview", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [requestCount, activeOrders, pendingSuppliers, pendingProducts, quotationTotals, productCommissions] = await Promise.all([
      Request.countDocuments(),
      Request.countDocuments({ status: { $in: ["Ordered", "Shipping"] } }),
      SupplierApplication.countDocuments({ status: "Pending" }),
      Product.countDocuments({ status: "Pending" }),
      Quotation.aggregate([
        { $group: {
          _id: "$currency",
          quotations: { $sum: 1 },
          quoted: { $sum: "$totalAmount" },
          collected: { $sum: "$amountPaid" },
          grossProfit: { $sum: { $add: ["$serviceFee", "$markupAmount"] } },
        } },
      ]),
      Product.aggregate([
        { $match: { status: "Approved", supplierPrice: { $exists: true }, publicPrice: { $exists: true } } },
        { $group: { _id: "$currency", commission: { $sum: { $subtract: ["$publicPrice", "$supplierPrice"] } } } },
      ]),
    ]);

    const financials = quotationTotals.map((item) => ({
      currency: item._id || "USD",
      quotations: item.quotations,
      quoted: item.quoted,
      collected: item.collected,
      balance: Math.max(item.quoted - item.collected, 0),
      grossProfit: item.grossProfit,
    }));

    res.json({
      success: true,
      overview: {
        requestCount,
        activeOrders,
        pendingSuppliers,
        pendingProducts,
        financials,
        catalogueCommissions: productCommissions.map((item) => ({ currency: item._id || "USD", commission: item.commission })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load admin overview", error: error.message });
  }
});

app.get("/admin/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users, requestCounts, productCounts, activeSessions] = await Promise.all([
      User.find().select("name email role supplierStatus phone country companyName avatar accountStatus suspendedAt suspensionReason createdAt updatedAt").sort({ createdAt: -1 }).lean(),
      Request.aggregate([{ $match: { userId: { $ne: null } } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: "$supplierId", count: { $sum: 1 } } }]),
      VisitorSession.find({ userId: { $ne: null }, lastSeen: { $gte: new Date(Date.now() - 90000) } }).select("userId lastSeen").lean(),
    ]);
    const requestsByUser = Object.fromEntries(requestCounts.map((item) => [String(item._id), item.count]));
    const productsByUser = Object.fromEntries(productCounts.map((item) => [String(item._id), item.count]));
    const onlineByUser = Object.fromEntries(activeSessions.map((item) => [String(item.userId), item.lastSeen]));
    const normalizedUsers = users.map((user) => ({
      ...user,
      accountStatus: user.accountStatus || "active",
      requestCount: requestsByUser[String(user._id)] || 0,
      productCount: productsByUser[String(user._id)] || 0,
      online: Boolean(onlineByUser[String(user._id)]),
      lastSeen: onlineByUser[String(user._id)] || null,
    }));
    res.json({ success: true, users: normalizedUsers, summary: {
      total: users.length,
      buyers: users.filter((user) => user.role === "buyer").length,
      suppliers: users.filter((user) => user.role === "supplier").length,
      admins: users.filter((user) => ["admin", "super_admin"].includes(user.role)).length,
      suspended: users.filter((user) => user.accountStatus === "suspended").length,
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load users", error: error.message });
  }
});

app.put("/admin/users/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!["active", "suspended"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Choose active or suspended" });
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "You cannot change your own account status" });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.role === "super_admin") return res.status(403).json({ success: false, message: "Super-admin accounts are protected" });
    if (target.role === "admin" && req.user.role !== "super_admin") return res.status(403).json({ success: false, message: "Only a super admin can manage admin accounts" });
    target.accountStatus = req.body.status;
    target.suspendedAt = req.body.status === "suspended" ? new Date() : null;
    target.suspensionReason = req.body.status === "suspended" ? String(req.body.reason || "Suspended by Afrilink administration").trim().slice(0, 300) : "";
    await target.save();
    res.json({ success: true, message: req.body.status === "suspended" ? "Account suspended" : "Account reactivated", user: removePassword(target) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update account status", error: error.message });
  }
});
// SUPPLIER APPLICATIONS

app.post("/supplier-applications", authMiddleware, async (req, res) => {
  try {
    const existingApplication = await SupplierApplication.findOne({
      userId: req.user.id,
      status: "Pending",
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending supplier application",
      });
    }

    const application = await SupplierApplication.create({
      userId: req.user.id,
      companyName: req.body.companyName,
      country: req.body.country,
      contactPerson: req.body.contactPerson,
      phone: req.body.phone,
      website: req.body.website,
      businessRegistration: req.body.businessRegistration,
      productCategories: req.body.productCategories || [],
      description: req.body.description,
    });

    res.json({
      success: true,
      message: "Supplier application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit supplier application",
      error: error.message,
    });
  }
});

app.get("/supplier-applications", authMiddleware, adminOnly, async (req, res) => {
  try {
    const applications = await SupplierApplication.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch supplier applications",
      error: error.message,
    });
  }
});

app.get("/supplier-applications/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const application = await SupplierApplication.findById(req.params.id)
      .populate("userId", "name email role");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Supplier application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch supplier application",
      error: error.message,
    });
  }
});

app.put("/supplier-applications/:id/approve", authMiddleware, adminOnly, async (req, res) => {
  try {
    const application = await SupplierApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Supplier application not found",
      });
    }

    application.status = "Approved";
    await application.save();

    await User.findByIdAndUpdate(application.userId, {
      role: "supplier",
    });

    await notifyUser(application.userId, {
      type: "approval",
      title: "Supplier account approved",
      message: "Your Afrilink supplier account is approved. Product listing and private sourcing access are now active.",
      href: "/dashboard",
    });

    res.json({
      success: true,
      message: "Supplier application approved successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve supplier application",
      error: error.message,
    });
  }
});

app.put("/supplier-applications/:id/reject", authMiddleware, adminOnly, async (req, res) => {
  try {
    const application = await SupplierApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Supplier application not found",
      });
    }

    application.status = "Rejected";
    await application.save();

    await notifyUser(application.userId, {
      type: "approval",
      title: "Supplier application update",
      message: "Your supplier application was not approved. Please contact Afrilink for the next steps.",
      href: "/profile",
    });

    res.json({
      success: true,
      message: "Supplier application rejected",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject supplier application",
      error: error.message,
    });
  }
});

// PRIVATE SUPPLIER SOURCING
app.post("/supplier-rfqs", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { requestId, supplierId, message, deadline } = req.body;
    const [request, supplier] = await Promise.all([
      Request.findById(requestId),
      User.findOne({ _id: supplierId, role: "supplier" }),
    ]);
    if (!request || !supplier) {
      return res.status(400).json({ success: false, message: "Choose a valid request and approved supplier" });
    }

    const rfq = await SupplierRfq.create({ requestId, supplierId, sentBy: req.user.id, message, deadline });
    if (["Received", "Reviewing"].includes(request.status)) {
      request.status = "Sourcing Supplier";
      await request.save();
    }
    await notifyUser(supplierId, {
      type: "rfq",
      title: "New factory price request",
      message: `Afrilink requested your confidential offer for ${request.title}.`,
      href: "/supplier/price-requests",
    });
    res.json({ success: true, message: "Private price request sent to supplier", rfq });
  } catch (error) {
    const duplicate = error.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      success: false,
      message: duplicate ? "This supplier already received this request" : "Failed to send supplier request",
      error: error.message,
    });
  }
});

app.get("/admin/requests/:id/supplier-rfqs", authMiddleware, adminOnly, async (req, res) => {
  try {
    const rfqs = await SupplierRfq.find({ requestId: req.params.id })
      .populate("supplierId", "name email companyName")
      .sort({ createdAt: -1 });
    res.json({ success: true, rfqs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch supplier offers", error: error.message });
  }
});

app.get("/admin/supplier-rfqs/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const rfq = await SupplierRfq.findById(req.params.id)
      .populate("supplierId", "name email companyName")
      .populate("requestId", "title quantity");
    if (!rfq) return res.status(404).json({ success: false, message: "Supplier offer not found" });
    res.json({ success: true, rfq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch supplier offer", error: error.message });
  }
});

app.get("/supplier/rfqs", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const query = ["admin", "super_admin"].includes(req.user.role) ? {} : { supplierId: req.user.id };
    const rfqs = await SupplierRfq.find(query)
      .populate("requestId", "title description quantity country deliveryLocation status createdAt")
      .sort({ createdAt: -1 });
    res.json({ success: true, rfqs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch factory price requests", error: error.message });
  }
});

app.put("/supplier/rfqs/:id/respond", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const rfq = await SupplierRfq.findById(req.params.id);
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!rfq || (!isAdmin && rfq.supplierId.toString() !== req.user.id)) {
      return res.status(404).json({ success: false, message: "Price request not found" });
    }
    const unitPrice = Number(req.body.unitPrice);
    const totalPrice = Number(req.body.totalPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(totalPrice) || totalPrice <= 0 || !["USD", "ZMW"].includes(req.body.currency) || !String(req.body.leadTime || "").trim()) {
      return res.status(400).json({ success: false, message: "Enter a valid unit price, total offer, currency, and lead time" });
    }
    Object.assign(rfq, {
      currency: req.body.currency,
      unitPrice,
      totalPrice,
      minimumOrderQuantity: req.body.minimumOrderQuantity,
      leadTime: req.body.leadTime,
      shippingTerms: req.body.shippingTerms,
      notes: req.body.notes,
      status: "Responded",
      respondedAt: new Date(),
    });
    await rfq.save();
    await notifyAdmins({
      type: "response",
      title: "Supplier offer received",
      message: `A supplier submitted a confidential offer for this request.`,
      href: `/requests/${rfq.requestId}`,
    });
    res.json({ success: true, message: "Confidential factory offer submitted to Afrilink", rfq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit supplier offer", error: error.message });
  }
});
// QUOTATIONS
app.post("/quotations", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { supplierName, supplierEmail, requestId, currency = "ZMW", supplierCost,
      freightCost = 0, customsCost = 0, serviceFee = 0, markupAmount = 0,
      deliveryTime, validityDays = 14, terms, notes, status = "Draft", sourceRfqId } = req.body;

    let sourceRfq = null;
    if (sourceRfqId) {
      sourceRfq = await SupplierRfq.findOne({ _id: sourceRfqId, requestId, status: "Responded" }).populate("supplierId", "name email companyName");
      if (!sourceRfq) return res.status(400).json({ success: false, message: "Select a valid responded supplier offer" });
    }

    const finalSupplierName = sourceRfq?.supplierId?.companyName || sourceRfq?.supplierId?.name || supplierName;
    const finalSupplierEmail = sourceRfq?.supplierId?.email || supplierEmail;
    const finalCurrency = sourceRfq?.currency || currency;
    const finalSupplierCost = sourceRfq?.totalPrice || supplierCost;
    const finalDeliveryTime = sourceRfq?.leadTime || deliveryTime;

    if (!finalSupplierName || !requestId || !finalDeliveryTime || finalSupplierCost === undefined) {
      return res.status(400).json({ success: false, message: "Supplier, request, supplier cost, and delivery time are required" });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const amounts = [finalSupplierCost, freightCost, customsCost, serviceFee, markupAmount].map(Number);
    if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
      return res.status(400).json({ success: false, message: "Quotation amounts must be valid positive numbers" });
    }

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const quotationNumber = `AFC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const quotation = await Quotation.create({
      quotationNumber, supplierName: finalSupplierName, supplierEmail: finalSupplierEmail, requestId, currency: finalCurrency, sourceRfqId,
      supplierCost: amounts[0], freightCost: amounts[1], customsCost: amounts[2],
      serviceFee: amounts[3], markupAmount: amounts[4], totalAmount,
      deliveryTime: finalDeliveryTime, validityDays, terms, notes, status, createdBy: req.user.id,
    });

    if (sourceRfq) {
      sourceRfq.status = "Selected";
      await sourceRfq.save();
    }

    if (status === "Sent") {
      request.status = "Quotation Ready";
      await request.save();
      await notifyUser(request.userId, {
        type: "quotation",
        title: "Your Afrilink quotation is ready",
        message: `${quotation.quotationNumber} is ready for your review.`,
        href: `/my-requests/${request._id}`,
      });
    }

    res.json({
      success: true,
      message: "Quotation created successfully",
      quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit quotation",
      error: error.message,
    });
  }
});

app.get("/requests/:id/quotations", authMiddleware, adminOnly, async (req, res) => {
  try {
    const quotations = await Quotation.find({ requestId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch quotations", error: error.message });
  }
});

app.put("/quotations/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const allowedStatuses = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid quotation status" });
    }

    const statusUpdate = { status: req.body.status };
    if (req.body.status === "Accepted") statusUpdate.acceptedAt = new Date();
    if (req.body.status === "Rejected") statusUpdate.rejectedAt = new Date();
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, statusUpdate, { new: true, runValidators: true });
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    if (req.body.status === "Sent") {
      const request = await Request.findByIdAndUpdate(quotation.requestId, { status: "Quotation Ready" }, { new: true });
      await notifyUser(request?.userId, {
        type: "quotation",
        title: "Your Afrilink quotation is ready",
        message: `${quotation.quotationNumber} is ready for your review.`,
        href: `/my-requests/${quotation.requestId}`,
      });
    } else if (req.body.status === "Accepted") {
      await Request.findByIdAndUpdate(quotation.requestId, { status: "Awaiting Deposit" });
    } else if (req.body.status === "Rejected") {
      await Request.findByIdAndUpdate(quotation.requestId, { status: "Reviewing" });
    }
    res.json({ success: true, quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update quotation", error: error.message });
  }
});

app.put("/quotations/:id/payment", authMiddleware, adminOnly, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const amountPaid = Number(req.body.amountPaid);
    if (!Number.isFinite(amountPaid) || amountPaid < 0 || amountPaid > quotation.totalAmount) {
      return res.status(400).json({ success: false, message: "Amount paid must be between zero and the quotation total" });
    }

    quotation.amountPaid = amountPaid;
    quotation.paymentMethod = req.body.paymentMethod || "";
    quotation.paymentReference = req.body.paymentReference || "";
    quotation.paymentNotes = req.body.paymentNotes || "";
    quotation.paymentStatus = amountPaid === 0 ? "Unpaid" : amountPaid >= quotation.totalAmount ? "Paid" : "Partially Paid";
    quotation.paidAt = quotation.paymentStatus === "Paid" ? new Date() : undefined;
    await quotation.save();

    if (amountPaid > 0) {
      const request = await Request.findByIdAndUpdate(quotation.requestId, { status: "Ordered" }, { new: true });
      await notifyUser(request?.userId, {
        type: "payment",
        title: "Payment record updated",
        message: `${quotation.currency} ${amountPaid.toLocaleString()} is recorded against ${quotation.quotationNumber}.`,
        href: `/my-requests/${quotation.requestId}`,
      });
    }

    res.json({
      success: true,
      message: "Payment record updated",
      quotation,
      balance: Math.max(quotation.totalAmount - quotation.amountPaid, 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update payment", error: error.message });
  }
});

// NOTIFICATIONS
app.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ userId: req.user.id, readAt: { $exists: false } }),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
});

app.put("/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, readAt: { $exists: false } }, { readAt: new Date() });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notifications", error: error.message });
  }
});

app.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notification", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
