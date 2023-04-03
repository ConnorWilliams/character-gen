import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { ChatService } from "../services/chat-service";
import { internalServerError } from "../utils/api-errors";
import { formatResponse } from "../utils/format-response";
import { Log } from "../utils/logger";

export class ChatsController {
  constructor(private readonly chatService = new ChatService()) {}

  public async getChats(
    event: APIGatewayProxyWithCognitoAuthorizerEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const chats = await this.chatService.getChats(
        event.requestContext.authorizer.claims.sub
      );
      return formatResponse(200, { chats: JSON.stringify(chats) });
    } catch (error) {
      if (error instanceof Error) {
        Log.error(`Could not get chats.`, error);
      }
      return internalServerError();
    }
  }
}
