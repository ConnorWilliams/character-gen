import {
  APIGatewayProxyResult,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import { CharactersController } from "./controllers/characters-controller";
import { Log } from "./utils/logger";

export class CharactersHandler {
  constructor(private readonly httpController = new CharactersController()) {}

  public async getCharacters(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler getCharacters invoked.`, {
      event,
    });
    return await this.httpController.getCharacters(event);
  }

  public async getCharacter(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler getCharacter invoked.`, {
      event,
    });
    return await this.httpController.getCharacter(event);
  }

  public async createCharacter(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler createCharacter invoked.`, {
      event,
    });
    return await this.httpController.createCharacter(event);
  }
}

const handler = new CharactersHandler();

export const getCharacters = handler.getCharacters.bind(handler);
export const getCharacter = handler.getCharacter.bind(handler);
export const createCharacter = handler.createCharacter.bind(handler);
