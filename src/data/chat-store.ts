import { Log } from "../utils/logger";
import { ChatStoreError, DecodingError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { ChatItem, chatSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Character, Chat, Message } from "./dto";
import { v4 as uuidv4 } from "uuid";
import { decode, decodeNotThrow } from "../utils/decode";
import { array, string } from "io-ts";

export class ChatStore {
  private readonly model: Model;
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

    this.model.serializer.add("CreateChatSerializer", {
      modify: (_, original) => {
        return {
          userId: decode(original.pk, string),
          chatId: decode(original.sk, string),
          character: decode(JSON.parse(original.character), Character),
          initialPrompt: decode(original.initialPrompt, string),
          messages: decode(original.messages, array(Message)),
          createdAt: new Date(original.createdAt).toLocaleString(),
          updatedAt: new Date(original.updatedAt).toLocaleString(),
        };
      },
    });

    this.model.serializer.add("QueryChatSerializer", {
      modify: (serialized, original) => {
        return {
          ...serialized,
          character: decode(JSON.parse(original.character), Character),
          createdAt: new Date(original.createdAt).toLocaleString(),
          updatedAt: new Date(original.updatedAt).toLocaleString(),
        };
      },
    });
  }

  public async getChats(userId: string): Promise<Chat[]> {
    try {
      const chats = await this.model
        .query("pk")
        .eq(userId)
        .and()
        .where("sk")
        .beginsWith("chat")
        .exec();
      return chats.map((chat) =>
        decode(chat.serialize("QueryChatSerializer"), Chat)
      );
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get chat records`);
    }
  }

  public async getChat(
    userId: string,
    chatId: string
  ): Promise<Chat | undefined> {
    try {
      const chat = await this.model.get({
        pk: userId,
        sk: `chat#${chatId}`,
      });
      return decodeNotThrow(chat.serialize("QueryChatSerializer"), Chat);
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get chat record`);
    }
  }

  public async createChat(
    userId: string,
    character: Character,
    firstMessage: Message
  ): Promise<Chat> {
    try {
      const chat = await this.model.create({
        userId: userId,
        chatId: `chat#${uuidv4()}`,
        character: JSON.stringify(character),
        initialPrompt: "", //TODO: add initial prompt from openai
        messages: [firstMessage],
      });
      const serializedChat = chat.serialize("CreateChatSerializer");
      return decode(serializedChat, Chat);
    } catch (error) {
      if (error instanceof DecodingError) {
        Log.warn(`Could not decode`, error);
      }
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
  ): Promise<Chat> {
    try {
      const chat = await this.model.get({
        pk: userId,
        sk: `chat#${chatId}`,
      });
      const decodedChat = decode(chat.serialize("QueryChatSerializer"), Chat);
      decodedChat.messages.push(message);
      const updatedChat = await this.model.update(decodedChat);
      return decode(updatedChat.serialize("CreateChatSerializer"), Chat);
    } catch (error) {
      if (error instanceof DecodingError) {
        Log.warn(`Could not decode`, error);
      }
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
