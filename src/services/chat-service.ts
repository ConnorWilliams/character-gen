import { ChatStore } from "../data/chat-store";
import { Chat, Message, MessageResponse } from "../data/dto";
import { CharacterService } from "./character-service";

export class ChatService {
  constructor(
    private readonly chatStore = new ChatStore(),
    private readonly characterService = new CharacterService()
  ) {}

  public async getChats(userId: string): Promise<Chat[]> {
    return await this.chatStore.getChats(userId);
  }

  public async getChat(
    userId: string,
    chatId: string
  ): Promise<Chat | undefined> {
    return await this.chatStore.getChat(userId, chatId);
  }

  public async startChat(userId: string, characterId: string): Promise<Chat> {
    const characterWithUpdatedChatCount =
      await this.characterService.incrementNumberOfChats(userId, characterId);
    const firstMessage: Message = {
      name: characterWithUpdatedChatCount.name,
      text: `Hello user ${userId}, my name is ${characterWithUpdatedChatCount.name}. How can I help you today?`, // TODO: Add openai call here
      timestamp: Date.now().toString(),
    };
    return await this.chatStore.createChat(
      userId,
      characterWithUpdatedChatCount,
      firstMessage
    );
  }

  public async deleteChat(userId: string, chatId: string): Promise<void> {
    return await this.chatStore.deleteChat(userId, chatId);
  }

  public async sendMessage(
    userId: string,
    chatId: string,
    text: string
  ): Promise<MessageResponse> {
    let chat: Chat;
    const message: Message = {
      name: userId, //TODO: change to user name
      text: text,
      timestamp: Date.now().toString(),
    };
    chat = await this.chatStore.addMessageToChat(userId, chatId, message);
    const response: Message = {
      name: chat.character.name,
      text: "Example response", //TODO: Add openai call here
      timestamp: Date.now().toString(),
    };
    chat = await this.chatStore.addMessageToChat(userId, chatId, response);
    return {
      message,
      response,
    };
  }
}
