import * as iots from "io-ts";

export const Message = iots.type({
  id: iots.string,
  role: iots.union([iots.literal("user"), iots.literal("character")]),
  timestamp: iots.string,
  content: iots.string,
});
export type Message = iots.TypeOf<typeof Message>;

export const RequiredCharacterProperties = ["life_goal"];

export const Character = iots.type({
  characterId: iots.string,
  userId: iots.string,
  name: iots.string,
  description: iots.string,
  properties: iots.record(iots.string, iots.string),
  numberOfConversations: iots.number,
  createdAt: iots.string,
  updatedAt: iots.string,
});
export type Character = iots.TypeOf<typeof Character>;

export const Chat = iots.type({
  chatId: iots.string,
  userId: iots.string,
  character: Character,
  initialPrompt: iots.string,
  messages: iots.array(Message),
  createdAt: iots.string,
  updatedAt: iots.string,
});
export type Chat = iots.TypeOf<typeof Chat>;

export const StartChatInput = iots.type({
  characterId: iots.string,
});
export type StartChatInput = iots.TypeOf<typeof StartChatInput>;

export const SendMessageInput = iots.type({
  message: iots.string,
});
export type SendMessageInput = iots.TypeOf<typeof SendMessageInput>;

export const CreateCharacterInput = iots.type({
  name: iots.string,
  description: iots.string,
  properties: iots.record(iots.string, iots.string),
});
export type CreateCharacterInput = iots.TypeOf<typeof CreateCharacterInput>;

export const MessageResponse = iots.type({
  message: Message,
  response: Message,
});
export type MessageResponse = iots.TypeOf<typeof MessageResponse>;

export const OpenAiSecret = iots.type({
  apiKeyName: iots.string,
  apiKey: iots.string,
  organizationId: iots.string,
});
export type OpenAiSecret = iots.TypeOf<typeof OpenAiSecret>;
