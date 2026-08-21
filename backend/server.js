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

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
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
app.post("/requests", async (req, res) => {
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

app.get("/requests", authMiddleware, async (req, res) => {
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

app.get("/requests/:id", authMiddleware, async (req, res) => {
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
app.post("/products", authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.json({
      success: true,
      message: "Product created successfully",
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
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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

app.put("/products/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        delivery: req.body.delivery,
        origin: req.body.origin,
        description: req.body.description,
        image: req.body.image,
        video: req.body.video,
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

app.delete("/products/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
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
  try {
    const { name, email, password } = req.body;
    const role = "buyer";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user: removePassword(user),
    });
  } catch (error) {
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
app.post("/quotations", async (req, res) => {
  try {
    const { supplierName, supplierEmail, requestId, price, message } = req.body;

    const quotation = await Quotation.create({
      supplierName,
      supplierEmail,
      requestId,
      price,
      message,
    });

    res.json({
      success: true,
      message: "Quotation submitted successfully",
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
