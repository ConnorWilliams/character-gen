import { ChatStore } from "../data/chat-store";
import { Chat, Message, MessageResponse } from "../data/dto";
import { CharacterService } from "./character-service";
import { OpenAiService } from "./openai-service";

export class ChatService {
  constructor(
    private readonly chatStore = new ChatStore(),
    private readonly characterService = new CharacterService(),
    private readonly openAiService = new OpenAiService()
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
    const firstCharacterMessage: string = await this.openAiService.startChat(
      characterWithUpdatedChatCount
    );
    const firstMessage: Message = {
      id: characterWithUpdatedChatCount.characterId,
      role: "character",
      content: firstCharacterMessage,
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
      id: userId, //TODO: change to user name
      role: "user",
      content: text,
      timestamp: Date.now().toString(),
    };
    chat = await this.chatStore.addMessageToChat(userId, chatId, message);
    const response: Message = {
      id: chat.character.characterId,
      role: "character",
      content: await this.openAiService.getReply(chat),
      timestamp: Date.now().toString(),
    };
    chat = await this.chatStore.addMessageToChat(userId, chatId, response);
    return {
      message,
      response,
    };
  }
}
