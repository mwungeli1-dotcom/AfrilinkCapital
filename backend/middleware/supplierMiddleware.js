function supplierMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login first.",
    });
  }

  if (req.user.role !== "supplier" && req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Supplier access required.",
    });
  }

  next();
}

module.exports = supplierMiddleware;