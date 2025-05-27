import express from "express";
import { login, register } from "../controller/userController";
import { getUserChats, sendMessage, startChat } from "../controller/chatController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/start",isAuthenticated, startChat);
router.get("/user/:userId",isAuthenticated, getUserChats);
router.post("/message",isAuthenticated, sendMessage);

export default router;
