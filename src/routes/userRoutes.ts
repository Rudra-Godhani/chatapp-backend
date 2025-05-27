import express from "express";
import { getAllUsers, getUser, login, logout, register } from "../controller/userController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getallusers", getAllUsers);
router.get("/getuser", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);

export default router;
