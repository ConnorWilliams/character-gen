import { Log } from "../utils/logger";
import { ChatStoreError, DecodingError } from "../utils/errors";
import { Model } from "dynamoose/dist/Model";
import { CharacterItem, characterSchema } from "./dynamoose/chat";
import * as dynamoose from "dynamoose";
import { DYNAMOOSE_DEFAULT_OPTIONS } from "../utils/dynamoose";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Character, CharacterProperty, CreateCharacterInput } from "./dto";
import { v4 as uuidv4 } from "uuid";
import { decode } from "../utils/decode";
import { array, number, string } from "io-ts";

export class CharacterStore {
  private readonly model: Model;
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

    this.model.serializer.add("CreateCharacterSerializer", {
      modify: (_, original) => {
        return {
          userId: decode(original.pk, string),
          characterId: decode(original.sk, string),
          name: decode(original.name, string),
          description: decode(original.description, string),
          numberOfConversations: decode(original.numberOfConversations, number),
          createdAt: new Date(original.createdAt).toLocaleString(),
          updatedAt: new Date(original.updatedAt).toLocaleString(),
          properties: decode(original.properties, array(CharacterProperty)),
        };
      },
    });

    this.model.serializer.add("QueryCharacterSerializer", {
      modify: (serialized, original) => {
        return {
          ...serialized,
          createdAt: new Date(original.createdAt).toLocaleString(),
          updatedAt: new Date(original.updatedAt).toLocaleString(),
        };
      },
    });
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
      return characters.map((character) =>
        decode(character.serialize("QueryCharacterSerializer"), Character)
      );
    } catch (error) {
      if (error instanceof Error) {
        Log.warn(`Could not get characters`, error);
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
        description: characterInput.description,
        properties: characterInput.properties,
      });
      const serializedCharacter = character.serialize(
        "CreateCharacterSerializer"
      );
      return decode(serializedCharacter, Character);
    } catch (error) {
      if (error instanceof DecodingError) {
        Log.warn(`Could not decode character from DB`, error);
      } else if (error instanceof Error) {
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
