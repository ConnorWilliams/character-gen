import {
  APIGatewayProxyResult,
  APIGatewayProxyWithCognitoAuthorizerEvent,
} from "aws-lambda";
import { ChatsController } from "./controllers/chats-controller";
import { Log } from "./utils/logger";

export class ChatsHandler {
  constructor(private readonly httpController = new ChatsController()) {}

  public async getChats(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler getChats invoked.`, {
      event,
    });
    return await this.httpController.getChats(event);
  }
}

const handler = new ChatsHandler();

export const getChats = handler.getChats.bind(handler);
