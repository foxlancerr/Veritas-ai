import jwt from "jsonwebtoken";

const genToken = (user) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export { genToken, verifyToken };
