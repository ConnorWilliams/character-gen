import { CharacterStore } from "../data/character-store";
import { Character, CreateCharacterInput } from "../data/dto";
import { CharacterNotFoundError } from "../utils/errors";

export class CharacterService {
  constructor(private readonly characterStore = new CharacterStore()) {}

  public async getCharacter(
    userId: string,
    characterId: string
  ): Promise<Character | undefined> {
    return await this.characterStore.getCharacter(userId, characterId);
  }

  public async getCharacters(userId: string): Promise<Character[]> {
    return await this.characterStore.getCharacters(userId);
  }

  public async createCharacter(
    userId: string,
    character: CreateCharacterInput
  ): Promise<Character> {
    return await this.characterStore.createCharacter(userId, character);
  }

  public async incrementNumberOfChats(
    userId: string,
    characterId: string
  ): Promise<Character> {
    const character = await this.characterStore.getCharacter(
      userId,
      characterId
    );
    if (!character) {
      throw new CharacterNotFoundError(
        `Character not found with id ${characterId}`
      );
    }
    return await this.characterStore.incrementNumberOfConversations(character);
  }
}
