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

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_NOW";

function removePassword(user) {
  const cleanUser = user.toObject ? user.toObject() : user;
  delete cleanUser.password;
  return cleanUser;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return next();
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Invalid authorization header" });
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.get("/", (req, res) => {
  res.json({ message: "Afrilink Hub Backend Running 🚀" });
});

// REQUESTS
app.post("/requests", optionalAuthMiddleware, async (req, res) => {
  try {
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

    const newRequest = new Request({
      userId: req.user?.id,
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

app.post("/products", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const requiredFields = ["name", "category", "description", "supplierPrice", "origin", "delivery"];
    const missingFields = requiredFields.filter((field) => !String(req.body[field] || "").trim());
    if (missingFields.length) {
      return res.status(400).json({ success: false, message: "Complete all required product details", missingFields });
    }
    const pricing = calculateProductPricing(req.body.supplierPrice, req.body.currency);
    if (!pricing) return res.status(400).json({ success: false, message: "Enter a valid supplier price greater than zero" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      ...pricing,
      origin: req.body.origin,
      delivery: req.body.delivery,
      image: req.body.image,
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
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: { $ne: false },
      $or: [{ status: "Approved" }, { status: { $exists: false } }],
    }).select("-supplierId -supplierPrice -markupPercent");

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

app.put("/products/:id", authMiddleware, supplierOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && product.supplierId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit your own products" });
    }

    const pricing = calculateProductPricing(req.body.supplierPrice, req.body.currency || product.currency);
    if (!pricing) return res.status(400).json({ success: false, message: "Enter a valid supplier price greater than zero" });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        ...pricing,
        delivery: req.body.delivery,
        origin: req.body.origin,
        description: req.body.description,
        image: req.body.image,
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
        role: user.role,
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
// QUOTATIONS
app.post("/quotations", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { supplierName, supplierEmail, requestId, currency = "ZMW", supplierCost,
      freightCost = 0, customsCost = 0, serviceFee = 0, markupAmount = 0,
      deliveryTime, validityDays = 14, terms, notes, status = "Draft" } = req.body;

    if (!supplierName || !requestId || !deliveryTime || supplierCost === undefined) {
      return res.status(400).json({ success: false, message: "Supplier, request, supplier cost, and delivery time are required" });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const amounts = [supplierCost, freightCost, customsCost, serviceFee, markupAmount].map(Number);
    if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
      return res.status(400).json({ success: false, message: "Quotation amounts must be valid positive numbers" });
    }

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const quotationNumber = `AFC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const quotation = await Quotation.create({
      quotationNumber, supplierName, supplierEmail, requestId, currency,
      supplierCost: amounts[0], freightCost: amounts[1], customsCost: amounts[2],
      serviceFee: amounts[3], markupAmount: amounts[4], totalAmount,
      deliveryTime, validityDays, terms, notes, status, createdBy: req.user.id,
    });

    if (status === "Sent") {
      request.status = "Quotation Ready";
      await request.save();
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
      await Request.findByIdAndUpdate(quotation.requestId, { status: "Quotation Ready" });
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
      await Request.findByIdAndUpdate(quotation.requestId, { status: "Ordered" });
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
