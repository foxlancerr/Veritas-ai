import jwt from "jsonwebtoken";

const genToken = (user) => {
  const token = jwt.sign({user}, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

export default genToken;
