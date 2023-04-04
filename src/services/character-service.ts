import { CharacterStore } from "../data/character-store";
import { Character } from "../data/dto";
import { CharacterItem } from "../data/dynamoose/chat";

export class CharacterService {
  constructor(private readonly characterStore = new CharacterStore()) {}

  public async getCharacter(
    userId: string,
    characterId: string
  ): Promise<CharacterItem> {
    return await this.characterStore.getCharacter(userId, characterId);
  }

  public async getCharacters(userId: string): Promise<CharacterItem[]> {
    return await this.characterStore.getCharacters(userId);
  }

  public async createCharacter(
    userId: string,
    character: Character
  ): Promise<CharacterItem> {
    return await this.characterStore.createCharacter(userId, character);
  }

  public async incrementNumberOfChats(
    userId: string,
    characterId: string
  ): Promise<CharacterItem> {
    const character = await this.characterStore.getCharacter(
      userId,
      characterId
    );
    return await this.characterStore.incrementNumberOfConversations(character);
  }
}
