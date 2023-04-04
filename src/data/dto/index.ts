import * as iots from "io-ts";

export const Message = iots.type({
  name: iots.string,
  timestamp: iots.string,
  text: iots.string,
});
export type Message = iots.TypeOf<typeof Message>;

export const Character = iots.type({
  name: iots.string,
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
  life_goal: iots.string,
});
export type CreateCharacterInput = iots.TypeOf<typeof CreateCharacterInput>;
