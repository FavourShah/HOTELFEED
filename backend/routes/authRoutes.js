import express from "express";
import {
  registerUser,
  registerGuest,
  loginUser,
  loginGuest,
  getAllUsers,

  updateUser,
  deleteUser,
  getAvailableRooms,

} from "../controllers/authController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/login", loginUser);                 // staff login
router.post("/guest-login", loginGuest);          // guest login
router.get("/rooms", getAvailableRooms);   
       // public room list

// Staff Registration & Management (IT only)

router.post("/register",  registerUser);       // register staff
router.get("/staff", protect, requireIT, getAllUsers);            // fetch all staff
router.put("/users/:id", protect, requireIT, updateUser);         // update staff
router.delete("/users/:id", protect, requireIT, deleteUser);      // delete staff

// Guest Registration (IT or Front Office)
router.post("/guest-register", protect, registerGuest);           // register guest


export default router;