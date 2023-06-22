import { Log } from "../utils/logger";
import { ChatStoreError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { CharacterItem, characterSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Character } from "./dto";
import { v4 as uuidv4 } from "uuid";

export class CharacterStore {
  private readonly model: Model<CharacterItem>;
  private readonly characterTableName = narrowOrThrow(
    process.env.CHAT_TABLE_NAME,
    "CHAT_TABLE_NAME not set"
  );

  constructor() {
    this.model = dynamoose.model<CharacterItem>(
      this.characterTableName,
      characterSchema,
      DYNAMOOSE_DEFAULT_OPTIONS
    );
  }

  public async getCharacters(userId: string): Promise<CharacterItem[]> {
    try {
      return await this.model
        .query("userId")
        .eq(userId)
        .and()
        .where("characterId")
        .beginsWith("character")
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get character records`);
    }
  }

  public async getCharacter(
    userId: string,
    characterId: string
  ): Promise<CharacterItem> {
    try {
      return await this.model.get({
        pk: userId,
        sk: `${characterId}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get character record`);
    }
  }

  public async createCharacter(
    userId: string,
    character: Character
  ): Promise<CharacterItem> {
    try {
      return await this.model.create({
        userId: userId,
        characterId: `character#${uuidv4()}`,
        name: character.name,
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not create character record`);
    }
  }

  public async incrementNumberOfConversations(
    character: CharacterItem
  ): Promise<CharacterItem> {
    try {
      return await this.model.update({
        userId: character.userId,
        characterId: character.characterId,
        numberOfConversations: character.numberOfConversations++,
      });
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not update character record`);
    }
  }
}
