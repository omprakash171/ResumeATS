import express from "express";
import {
  sendContactMessage,
  getAllContacts,
} from "../controllers/contactController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", sendContactMessage);
router.get("/all", authMiddleware, getAllContacts);

export default router;
