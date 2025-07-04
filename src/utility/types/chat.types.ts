import { IGetCommon } from "./common.types";

export interface ISendMessage {
  chatId?: string;
  text: string;
  recieverId: string;
}

export interface IGetChat extends IGetCommon {
  participant?: string;
}
