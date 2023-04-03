import { Log } from "../utils/logger";
import { ChatStoreError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { ChatItem, chatSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";

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
}
