import { Chat } from "../models/chat";
import { Contact } from "../models/contacts";
import { catchError } from "../utility/catchBlock";
import HTTPError from "../utility/httpError";
import { getIO } from "../utility/socket";
import { ITokenData } from "../utility/types/auth.types";
import { IGetChat, ISendMessage } from "../utility/types/chat.types";
import { IGetCommon } from "../utility/types/common.types";

export class ChatServices {
  public async getContacts(data: IGetCommon, user: ITokenData) {
    try {
      const { id, search } = data;

      const filters: any = { primaryUser: user.id };

      if (id) {
        filters._id = id;
      }
      //TODO: Implement search functionality
      if (search) {
      }

      //find contacts under the user
      const findContacts = await Contact.find(filters)
        .populate({
          path: "contact.userDetails",
          select: "fullName email profile",
        })
        .sort({ updatedAt: -1 });
      return {
        success: true,
        data: findContacts,
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async getChats(data: IGetChat, user: ITokenData) {
    try {
      const { id, search, participant } = data;

      const filters: any = { participants: { $in: [user.id] } };

      if (id) {
        filters._id = id;
      }
      if (participant) {
        filters.participants = { $all: [participant, user.id] };
      }
      //TODO: Implement search functionality
      if (search) {
      }
      //find contacts under the user
      const findChats = await Chat.find(filters)
        .populate({ path: "participants", select: "fullName email profile" })
        .populate({
          path: "chats.sender",
          select: "email profile fullName",
        })
        .sort({ updatedAt: -1 });

      const formattedChats = JSON.parse(JSON.stringify(findChats)).map(
        (chat: {
          participants: any[];
          chats: any[];
          createdAt: string;
          _id: string;
        }) => ({
          to: chat.participants.find((p: any) => p._id.toString() !== user.id)
            ?.fullName,
          recieverId: chat.participants
            .find((p: any) => p._id.toString() !== user.id)
            ?._id.toString(),
          chats: chat.chats.map(
            (c: {
              sender: { email: string };
              text: string;
              isRead: boolean;
            }) => ({
              ...c,
              sender: c.sender,
            })
          ),
          createdAt: chat.createdAt,
          _id: chat._id,
        })
      );

      return {
        success: true,
        data: formattedChats,
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async sendMessage(data: ISendMessage, user: ITokenData) {
    try {
      const { chatId, text, recieverId } = data;

      if (user.id === recieverId) {
        throw new HTTPError("You cannot send a message to yourself", 400);
      }

      //find the chat or create a new one
      let existingChat: any;
      if (chatId) {
        existingChat = await Chat.findOneAndUpdate(
          {
            $or: [
              { _id: chatId },
              { participants: { $all: [user.id, recieverId] } },
            ],
          },
          {
            $push: {
              chats: {
                text,
                sender: user.id,
                isRead: false,
              },
            },
          },
          { new: true }
        );
      } else {
        existingChat = await Chat.create({
          participants: [user.id, recieverId],
          chats: [
            {
              text,
              sender: user.id,
              isRead: false,
            },
          ],
        });
        await Contact.updateOne(
          {
            primaryUser: user.id,
            "contact.userDetails": recieverId,
          },
          { $set: { "contact.$.chatId": existingChat._id } }
        );
      }
      console.log("existingChat", existingChat, "\nChatId", chatId);

      //socket.io to emit the message to the chat room
      getIO()
        .to(chatId ?? existingChat._id.toString())
        .emit("receiveMessage", {
          chatId: chatId ?? existingChat._id.toString(),
          text,
          sender: {
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
          },
          createdAt: new Date().toISOString(),
        });

      return {
        success: true,
        message: "Message sent successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
}
