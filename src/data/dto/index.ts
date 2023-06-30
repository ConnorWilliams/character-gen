import * as iots from "io-ts";

export const Message = iots.type({
  name: iots.string,
  timestamp: iots.string,
  text: iots.string,
});
export type Message = iots.TypeOf<typeof Message>;

export const CharacterProperty = iots.type({
  name: iots.string,
  value: iots.string,
});
export type CharacterProperty = iots.TypeOf<typeof CharacterProperty>;

export const RequiredCharacterProperties = ["life_goal"];

export const Character = iots.type({
  characterId: iots.string,
  userId: iots.string,
  name: iots.string,
  description: iots.string,
  properties: iots.array(CharacterProperty),
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
  properties: iots.array(CharacterProperty),
});
export type CreateCharacterInput = iots.TypeOf<typeof CreateCharacterInput>;

export const MessageResponse = iots.type({
  message: Message,
  response: Message,
});
export type MessageResponse = iots.TypeOf<typeof MessageResponse>;
