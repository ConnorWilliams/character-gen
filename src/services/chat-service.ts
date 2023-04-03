import { ChatStore } from "../data/chat-store";
import { ChatItem } from "../data/dynamoose/chat";

export class ChatService {
  constructor(private readonly chatStore = new ChatStore()) {}

  public async getChats(userId: string): Promise<ChatItem[] | undefined> {
    return await this.chatStore.getChats(userId);
  }
}
