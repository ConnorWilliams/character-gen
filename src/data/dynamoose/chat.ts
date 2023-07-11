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
  updatedAt: string;
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
            id: String,
            role: String,
            timestamp: String,
            content: String,
          },
        },
      ],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export class CharacterItem extends Item {
  characterId: string;
  userId: string;
  name: string;
  description: string;
  properties: Record<string, string>;
  numberOfConversations: number;
  createdAt: string;
  updatedAt: string;
}

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
    description: {
      type: String,
      default: "",
    },
    properties: {
      type: Object,
    },
    numberOfConversations: {
      type: Number,
      default: 0,
    },
  },
  {
    saveUnknown: [
      "properties.*", // store 1 level deep of nested properties in `properties` property
    ],
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
