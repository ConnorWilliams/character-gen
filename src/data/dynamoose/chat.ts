import { Item } from "dynamoose/dist/Item";
import { Schema } from "dynamoose";

export class MessageItem extends Item {
  name: string;
  timestamp: string;
  text: string;
}

export class ChatItem extends Item {
  chatId: string;
  userId: string;
  character: CharacterItem;
  initialPrompt: string;
  messages: Array<MessageItem>;
  createdAt: string;
}

export class CharacterItem extends Item {
  characterId: string;
  userId: string;
  name: string;
  numberOfConversations: number;
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
    numberOfConversations: Number,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
