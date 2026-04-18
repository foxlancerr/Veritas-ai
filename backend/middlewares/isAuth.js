import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token;

    // ✅ 1. Get token from cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // ✅ 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    // ✅ 5. Attach user to request
    req.user = decoded.user;
    req.userId = decoded.user;



    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export default isAuth;
