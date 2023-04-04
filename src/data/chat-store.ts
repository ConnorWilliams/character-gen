import { Log } from "../utils/logger";
import { ChatStoreError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { CharacterItem, ChatItem, chatSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Message } from "./dto";
import { v4 as uuidv4 } from 'uuid';


export class ChatStore {
  private readonly model: Model<ChatItem>;
  private readonly chatsTableName = narrowOrThrow(
    process.env.CHAT_TABLE_NAME,
    "CHAT_TABLE_NAME not set"
  );

  constructor() {
    this.model = dynamoose.model<ChatItem>(
      this.chatsTableName,
      chatSchema,
      DYNAMOOSE_DEFAULT_OPTIONS
    );
  }

  public async getChats(userId: string): Promise<ChatItem[]> {
    try {
      return await this.model
        .query("pk")
        .eq(userId)
        .and()
        .where("sk")
        .beginsWith("chat")
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get chat records`);
    }
  }

  public async getChat(userId: string, chatId: string): Promise<ChatItem> {
    try {
      return await this.model.get({
        pk: userId,
        sk: `chat#${chatId}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get chat record`);
    }
  }

  public async createChat(
    userId: string,
    character: CharacterItem
  ): Promise<ChatItem> {
    try {
      return await this.model.create({
        userId: userId,
        chatId: `chat#${uuidv4()}`,
        // character: character, TODO: add character to chat
        initialPrompt: "",
        messages: [],
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not create chat record`);
    }
  }

  public async addMessageToChat(
    userId: string,
    chatId: string,
    message: Message
  ): Promise<ChatItem> {
    try {
      const chat = await this.model.get({
        pk: userId,
        sk: `chat#${chatId}`,
      });
      chat.messages.push(message);
      return await this.model.update(chat);
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not add message to chat record`);
    }
  }

  public async deleteChat(userId: string, chatId: string): Promise<void> {
    try {
      await this.model.delete({
        pk: userId,
        sk: `chat#${chatId}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo DELETE operation`, error);
      }
      throw new ChatStoreError(`Could not delete chat record`);
    }
  }
}
