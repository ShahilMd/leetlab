import { db } from "../libs/db.js";

const checkAdmin = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized access",
    });
  }

  if(user.role !== "ADMIN") {
    return res.status(403).json({
      status: false,
      message: "Forbidden Access",
    });
  }
  next();
};

export default checkAdmin