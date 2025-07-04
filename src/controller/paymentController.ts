import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import { ICreatePayment } from "../utility/types/payment.types";
import { PaymentServices } from "../services/paymentService";

const paymentObject = new PaymentServices();

export const createPayment = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);

    const { courseId, studentId, amount } = req.body;
    if (!courseId || !studentId || !amount)
      throw new HTTPError("Missing required fields", 412);
    if (studentId != user.id) throw new HTTPError("Unaothorised", 401);

    const data: ICreatePayment = {
      courseId,
      studentId,
      amount,
    };

    const newLecture = await paymentObject.createPaymentStudent(data);
    const code = newLecture.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, newLecture));
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};

export const stripePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) throw new HTTPError("Stripe Signature Missing", 412);

    const handleSuccess = await paymentObject.handlePaymentSuccesss(
      req.body,
      signature
    );
    const code = handleSuccess.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, handleSuccess));
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};
