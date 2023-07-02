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

  public async getChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler getChat invoked.`, {
      event,
    });
    return await this.httpController.getChat(event);
  }

  public async startChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler createChat invoked.`, {
      event,
    });
    return await this.httpController.createChat(event);
  }

  public async replyToChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    Log.info(`HttpHandler replyToChat invoked.`, {
      event,
    });
    return await this.httpController.sendMessage(event);
  }
}

const handler = new ChatsHandler();

export const getChats = handler.getChats.bind(handler);
export const getChat = handler.getChat.bind(handler);
export const startChat = handler.startChat.bind(handler);
export const replyToChat = handler.replyToChat.bind(handler);
