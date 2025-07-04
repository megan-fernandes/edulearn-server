import { Course } from "../models/course";
// import { Enrollment } from "../models/enrollment";
import { Payment } from "../models/payment";
import { catchError } from "../utility/catchBlock";
import HTTPError from "../utility/httpError";
import { ICreatePayment } from "../utility/types/payment.types";
import dotenv from "dotenv";
dotenv.config();
import { paymentSuccessKey } from "../constants";
import { Stripe } from "stripe";
import { Enrollment } from "../models/enrollment";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY as string);

export class PaymentServices {
  public async createPaymentStudent(data: ICreatePayment) {
    try {
      const { courseId, studentId, amount } = data;
      console.log(studentId);
      //ensure course exists and amount matches
      const findCourse = await Course.findOne({ _id: courseId });
      if (!findCourse) throw new HTTPError("Could not find course", 404);
      if (findCourse.cost != amount)
        throw new HTTPError("Amount sent by client not matching data", 400);

      //stripe
      const lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: findCourse.title ?? "Course",
              images: [findCourse.thumbnail ?? ""],
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ];

      const paymentSession = await stripe.checkout.sessions.create({
        // payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `http://localhost:5173/courses/${courseId}`,
        cancel_url: `http://localhost:5173/courses/${courseId}`,
      });

      //create payment with status=pending
      await Payment.create({
        status: "pending",
        details: {
          student: studentId,
          course: courseId,
        },
        paymentSessionId: paymentSession.id,
      });

      return {
        success: true,
        data: {
          sessionId: paymentSession.id,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async handlePaymentSuccesss(
    requestBody: any,
    signature: string | string[]
  ) {
    try {
      let event: Stripe.Event;
      // Use the raw body for signature verification
      try {
        event = stripe.webhooks.constructEvent(
          requestBody,
          signature,
          paymentSuccessKey
        );
      } catch (err: any) {
        throw new HTTPError(
          `Webhook signature verification failed: ${err.message}`,
          400
        );
      }
      if (!event) throw new HTTPError("Could not fetch event", 400);

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
        case "checkout.session.completed":
          {
            const paymentObj = event.data.object;
            const findPayment = await Payment.findOne({
              paymentSessionId: paymentObj.id,
            });
            if (!findPayment)
              throw new HTTPError(
                "Could not find payment details in database",
                404
              );
            if (paymentObj.status === "complete") {
              await Enrollment.create({
                course: findPayment.details.course,
                student: findPayment.details.student,
                paymentId: findPayment._id,
              });
              await Course.findOne({
                _id: findPayment.details.course,
              }).updateOne({
                $push: { studentsEnrolled: findPayment.details.student },
              });
              findPayment.status = "successful";
              findPayment.save();
            }
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return {
        success: true,
        message: "Student Enrolled successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
}
