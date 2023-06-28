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

export const Character = iots.strict({
  characterId: iots.string,
  userId: iots.string,
  name: iots.string,
  description: iots.string,
  properties: iots.array(CharacterProperty),
  numberOfConversations: iots.number,
  created_at: iots.string,
  updated_at: iots.string,
});
export type Character = iots.TypeOf<typeof Character>;

export const StartChatInput = iots.type({
  character_id: iots.string,
});
export type StartChatInput = iots.TypeOf<typeof StartChatInput>;

export const SendMessageInput = iots.type({
  chat_id: iots.string,
  message: iots.string,
});
export type SendMessageInput = iots.TypeOf<typeof SendMessageInput>;

export const CreateCharacterInput = iots.type({
  name: iots.string,
  description: iots.string,
  properties: iots.array(CharacterProperty),
});
export type CreateCharacterInput = iots.TypeOf<typeof CreateCharacterInput>;
