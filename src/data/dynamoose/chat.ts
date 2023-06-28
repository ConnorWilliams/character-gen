import { Item } from "dynamoose/dist/Item";
import { Schema } from "dynamoose";
import { Character, Message } from "../dto";

export class ChatItem extends Item {
  chatId: string;
  userId: string;
  character: Character;
  initialPrompt: string;
  messages: Array<Message>;
  createdAt: string;
}

export const chatSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
      map: "userId",
    },
    sk: {
      type: String,
      rangeKey: true,
      map: "chatId",
    },
    character: String,
    initialPrompt: String,
    messages: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            name: String,
            timestamp: Date,
            text: String,
          },
        },
      ],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: undefined, // updatedAt will not be stored as part of the timestamp
    },
  }
);

export const characterSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
      map: "userId",
    },
    sk: {
      type: String,
      rangeKey: true,
      map: "characterId",
    },
    name: String,
    numberOfConversations: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
