import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import { IGetCommon } from "../utility/types/common.types";
import { ChatServices } from "../services/chatService";
import { IGetChat, ISendMessage } from "../utility/types/chat.types";
import { VSendMessage } from "../utility/validations/chatValidation";

const chatObj = new ChatServices();

export const GetContacts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unaothorised", 401);

    const { id, search } = req.query;

    const data: IGetCommon = {
      id: id ? id.toString() : undefined,
      page: 1,
      search: search ? search.toString() : undefined,
    };
    const userContacts = await chatObj.getContacts(data, user);
    const code = userContacts.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, userContacts));
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

export const GetChats = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unaothorised", 401);

    const { id, search, participant } = req.query;

    const data: IGetChat = {
      id: id ? id.toString() : undefined, //chat Id
      page: 1,
      search: search ? search.toString() : undefined,
      participant: participant ? participant.toString() : undefined, //chat Id
    };
    const userChats = await chatObj.getChats(data, user);
    const code = userChats.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, userChats));
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

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unaothorised", 401);

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const { text, recieverId } = req.body;
    if (!text || !recieverId)
      throw new HTTPError("Missing required fields", 412);

    const { chatId } = req.query;

    const data: ISendMessage = {
      chatId: chatId ? chatId.toString() : undefined,
      text: text.toString(),
      recieverId: recieverId.toString(),
    };

    Helpers.validateWithZod(VSendMessage, data);

    const userChats = await chatObj.sendMessage(data, user);
    const code = userChats.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, userChats));
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

// export const UpdateChat = async (req: Request, res: Response) => {
//   try {
//     const user = req.user;
//     if (!user) throw new HTTPError("Unauthorised", 401);
//     const { chatId } = req.params;
//     if (!chatId) throw new HTTPError("Missing required fields", 412);

//     const data: ILectureIds = {
//       lectureId: lectureId.toString(),
//       chapterId: chapterId.toString(),
//     };

//     const LectureToggleResp = await lectureObj.lectureToggle(data, user);
//     const code = LectureToggleResp.success ? 200 : 400;
//     res
//       .status(httpStatusCodes[code].code)
//       .json(
//         Helpers.formResponse(httpStatusCodes[code].code, LectureToggleResp)
//       );
//   } catch (err) {
//     console.log("Error=>", err);
//     if (err instanceof HTTPError) {
//       const errorData = err.details || err.message;
//       res
//         .status(httpStatusCodes[err.code].code)
//         .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
//     } else {
//       res
//         .status(httpStatusCodes[500].code)
//         .json(
//           Helpers.formResponse(
//             httpStatusCodes[500].code,
//             "Internal server error"
//           )
//         );
//     }
//   }
// };
