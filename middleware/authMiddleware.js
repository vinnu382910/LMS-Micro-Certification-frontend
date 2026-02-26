const jwt = require("jsonwebtoken");
const { TOKEN_COOKIE_NAME } = require("../utils/authCookie");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  const bearerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = req.cookies?.[TOKEN_COOKIE_NAME];
  const token = cookieToken || bearerToken;

  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id name email role isActive isSuspended isVerified"
    );
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive || user.isSuspended) {
      return res.status(403).json({ message: "Account is inactive or suspended" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      isVerified: user.isVerified,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access Denied" });
  }
  next();
};
