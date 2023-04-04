import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { internalServerError, invalidRequest } from "../utils/api-errors";
import { formatResponse } from "../utils/format-response";
import { Log } from "../utils/logger";
import { decodeNotThrow } from "../utils/decode";
import { CreateCharacterInput } from "../data/dto";
import { CharacterService } from "../services/character-service";

export class CharactersController {
  constructor(private readonly characterService = new CharacterService()) {}

  public async getCharacters(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const characters = await this.characterService.getCharacters(
        event.requestContext.authorizer.claims.sub
      );
      return formatResponse(200, { characters: JSON.stringify(characters) });
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not get characters.`, error);
      }
      return internalServerError();
    }
  }

  public async getCharacter(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      if (!event.pathParameters || !event.pathParameters.characterId) {
        return invalidRequest();
      }
      const character = await this.characterService.getCharacter(
        event.requestContext.authorizer.claims.sub,
        event.pathParameters.characterId
      );
      return formatResponse(200, { character: JSON.stringify(character) });
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not get character.`, error);
      }
      return internalServerError();
    }
  }

  public async createCharacter(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const parsedInput = decodeNotThrow(
        JSON.parse(event.body as string),
        CreateCharacterInput
      );
      if (!parsedInput) {
        return invalidRequest();
      }
      const character = await this.characterService.createCharacter(
        event.requestContext.authorizer.claims.sub,
        { name: parsedInput.name }
      );
      return formatResponse(200, { character: JSON.stringify(character) });
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not create character.`, error);
      }
      return internalServerError();
    }
  }
}