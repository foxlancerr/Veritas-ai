import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Ensure this matches how your token is created

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default isAuth;
