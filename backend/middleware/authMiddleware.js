import jwt from "jsonwebtoken";
import { Staff } from "../models/staff.js";
import { Guest } from "../models/guest.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role } = decoded;

    let user;

    if (role === "guest") {
      user = await Guest.findById(userId);
    } else if (role === "supervisor") {
      // Handle supervisor as a virtual user
      user = {
        _id: userId,
        username: process.env.SUPERVISOR_USERNAME,
        fullName: "App Supervisor",
        role: "supervisor",
        status: "active",
      };
    } else {
      user = await Staff.findById(userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "User not found for token" });
    }

    req.user = user;
    req.user.role = role; // Attach role to the request
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};



export const requireIT = (req, res, next) => {

  const allowedRoles = ["it", "supervisor"];
  const userRole = req.user?.role?.toLowerCase();

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: `Access denied for role: ${userRole}` });
  }

  next();
};


