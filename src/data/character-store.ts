import { Log } from "../utils/logger";
import { ChatStoreError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { characterSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Character, CreateCharacterInput } from "./dto";
import { v4 as uuidv4 } from "uuid";
import { decode, decodeList } from "../utils/decode";
import { array } from "io-ts";

export class CharacterStore {
  private readonly model: Model;
  private readonly characterTableName = narrowOrThrow(
    process.env.CHAT_TABLE_NAME,
    "CHAT_TABLE_NAME not set"
  );

  constructor() {
    this.model = dynamoose.model(
      this.characterTableName,
      characterSchema,
      DYNAMOOSE_DEFAULT_OPTIONS
    );
  }

  public async getCharacters(userId: string): Promise<Character[]> {
    try {
      const characters = await this.model
        .query("userId")
        .eq(userId)
        .and()
        .where("characterId")
        .beginsWith("character")
        .exec();
      return decodeList(characters, array(Character));
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
  ): Promise<Character> {
    try {
      const character = await this.model.get({
        pk: userId,
        sk: `${characterId}`,
      });
      return decode(character, Character);
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo GET operation`, error);
      }
      throw new ChatStoreError(`Could not get character record`);
    }
  }

  public async createCharacter(
    userId: string,
    characterInput: CreateCharacterInput
  ): Promise<Character> {
    try {
      const character = await this.model.create({
        userId: userId,
        characterId: `character#${uuidv4()}`,
        name: characterInput.name,
      });
      return decode(character, Character);
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not create character record`);
    }
  }

  public async incrementNumberOfConversations(
    characterInput: Character
  ): Promise<Character> {
    try {
      const character = await this.model.update({
        userId: characterInput.userId,
        characterId: characterInput.characterId,
        numberOfConversations: characterInput.numberOfConversations++,
      });
      return decode(character, Character);
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not complete dynamo PUT operation`, error);
      }
      throw new ChatStoreError(`Could not update character record`);
    }
  }
}
