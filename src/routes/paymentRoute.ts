import express from "express";
import { authenticateUser } from "../middleware/user";
import {
  createPayment,
  stripePaymentSuccess,
} from "../controller/paymentController";

const router = express();

//create payment(website)
router.post("/payment/checkout", authenticateUser, createPayment);

router.post(
  "/payment/success",
  express.raw({ type: "application/json" }),
  stripePaymentSuccess
);

export default router;
