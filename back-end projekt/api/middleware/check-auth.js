const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if(!token) {
      throw new Error("Auth failed");
    }
    // console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {userId: decoded.userId};
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }
};
