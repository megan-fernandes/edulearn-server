import express from "express";
import { authenticateUser } from "../middleware/user";
import {
  GetChats,
  GetContacts,
  sendMessage,
  //   UpdateChat,
} from "../controller/chatController";

const router = express();

//Get all contacts
router.get("/chat/contacts", authenticateUser, GetContacts);

//Get Chats (also by ID)
router.get("/chat", authenticateUser, GetChats);

// Create New Chat - means send new message
router.post("/chat/message", authenticateUser, sendMessage);

//Update Chat (by chatId) - mark messages as read,etc
// router.patch("/chat/:chatId", authenticateUser, UpdateChat);

export default router;
