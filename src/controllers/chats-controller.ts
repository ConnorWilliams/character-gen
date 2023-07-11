import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { ChatService } from "../services/chat-service";
import {
  internalServerError,
  invalidRequest,
  notFound,
} from "../utils/api-errors";
import { formatResponse } from "../utils/format-response";
import { Log } from "../utils/logger";
import { decodeNotThrow } from "../utils/decode";
import { SendMessageInput, StartChatInput } from "../data/dto";
import { CharacterNotFoundError } from "../utils/errors";

export class ChatsController {
  constructor(private readonly chatService = new ChatService()) {}

  public async getChats(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const chats = await this.chatService.getChats(
        event.requestContext.authorizer.claims.sub
      );
      return formatResponse(200, chats);
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not get chats.`, error);
      }
      return internalServerError();
    }
  }

  public async getChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      if (!event.pathParameters || !event.pathParameters.chatId) {
        return invalidRequest();
      }
      const chat = await this.chatService.getChat(
        event.requestContext.authorizer.claims.sub,
        event.pathParameters.chatId
      );
      if (!chat) {
        return notFound();
      }
      return formatResponse(200, chat);
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not get chat.`, error);
      }
      return internalServerError();
    }
  }

  public async createChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const parsedInput = decodeNotThrow(
        JSON.parse(event.body as string),
        StartChatInput
      );
      if (!parsedInput) {
        return invalidRequest();
      }
      const chat = await this.chatService.startChat(
        event.requestContext.authorizer.claims.sub,
        parsedInput.characterId
      );
      return formatResponse(200, chat);
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        Log.error(`Could not find character to start chat.`, error);
        return notFound();
      }
      if (error instanceof Error) {
        Log.error(`Could not create chat.`, error);
      }
      return internalServerError();
    }
  }

  public async deleteChat(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      if (!event.pathParameters || !event.pathParameters.chatId) {
        return invalidRequest();
      }
      await this.chatService.deleteChat(
        event.requestContext.authorizer.claims.sub,
        event.pathParameters.chatId
      );
      return formatResponse(200);
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not delete chat.`, error);
      }
      return internalServerError();
    }
  }

  public async sendMessage(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      if (!event.pathParameters || !event.pathParameters.chatId) {
        return invalidRequest();
      }
      const parsedInput = decodeNotThrow(
        JSON.parse(event.body as string),
        SendMessageInput
      );
      if (!parsedInput) {
        return invalidRequest();
      }
      const messageResponse = await this.chatService.sendMessage(
        event.requestContext.authorizer.claims.sub,
        event.pathParameters.chatId,
        parsedInput.message
      );
      return formatResponse(200, messageResponse);
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not send message.`, error);
      }
      return internalServerError();
    }
  }
}
