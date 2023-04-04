import { ChatStore } from "../data/chat-store";
import { Message } from "../data/dto";
import { ChatItem } from "../data/dynamoose/chat";
import { CharacterService } from "./character-service";

export class ChatService {
  constructor(
    private readonly chatStore = new ChatStore(),
    private readonly characterService = new CharacterService()
  ) {}

  public async getChats(userId: string): Promise<ChatItem[]> {
    return await this.chatStore.getChats(userId);
  }

  public async getChat(userId: string, chatId: string): Promise<ChatItem> {
    return await this.chatStore.getChat(userId, chatId);
  }

  public async startChat(
    userId: string,
    characterId: string
  ): Promise<ChatItem> {
    const characterWithUpdatedChatCount =
      await this.characterService.incrementNumberOfChats(userId, characterId);
    return await this.chatStore.createChat(
      userId,
      characterWithUpdatedChatCount
    );
  }

  public async deleteChat(userId: string, chatId: string): Promise<void> {
    return await this.chatStore.deleteChat(userId, chatId);
  }

  public async sendMessage(
    userId: string,
    chatId: string,
    message: string
  ): Promise<ChatItem> {
    const messageItem: Message = {
      name: userId,
      text: message,
      timestamp: Date.now().toString(),
    };
    return await this.chatStore.addMessageToChat(userId, chatId, messageItem);
  }
}
