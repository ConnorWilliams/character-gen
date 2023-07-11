import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { SecretsService } from "./secrets-service";
import { narrowOrThrow } from "../utils/narrow-or-throw";
import { Character, Chat, OpenAiSecret } from "../data/dto";
import { decode } from "../utils/decode";
import { string } from "io-ts";
import { OpenAiError } from "../utils/errors";

export class OpenAiService {
  constructor(
    private readonly secretsService = SecretsService.getInstance(),
    private readonly model = "gpt-3.5-turbo"
  ) {}

  private async getOpenAi(): Promise<OpenAIApi> {
    const openAiSecretName = narrowOrThrow(
      process.env.OPENAI_SECRET_NAME,
      "Expected OPENAI_SECRET_NAME env var to be present"
    );
    const openAiSecret = decode(
      await this.secretsService.getSecret(openAiSecretName),
      OpenAiSecret
    );
    const openAiConfiguration = new Configuration({
      organization: openAiSecret.organizationId,
      apiKey: openAiSecret.apiKey,
    });
    return new OpenAIApi(openAiConfiguration);
  }

  public async startChat(character: Character): Promise<string> {
    const initialSystemMessage = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `You are a character that is engaging in a conversation with a user. Your name is ${character.name} and your life goal is ${character.properties.life_goal}.`,
    };
    const initialUserMessage = {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: "Hello, please can you introduce yourself?",
    };
    const openAi = await this.getOpenAi();
    const response = await openAi.createChatCompletion({
      model: this.model,
      messages: [initialSystemMessage, initialUserMessage],
    });
    if (!response.data.choices[0].message) {
      throw new OpenAiError("No message returned from OpenAI");
    }
    return decode(response.data.choices[0].message.content, string);
  }

  public async getReply(chat: Chat): Promise<string> {
    const initialSystemMessage = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `You are a character that is engaging in a conversation with a user. Your name is ${chat.character.name} and your life goal is ${chat.character.properties.life_goal}.`,
    };
    const openAi = await this.getOpenAi();
    const response = await openAi.createChatCompletion({
      model: this.model,
      messages: [
        initialSystemMessage,
        ...chat.messages.map((message) => ({
          role:
            message.role === "character"
              ? ChatCompletionRequestMessageRoleEnum.Assistant
              : ChatCompletionRequestMessageRoleEnum.User,
          // name: message.role === "character" ? chat.character.name : "user",
          content: message.content,
        })),
      ],
    });
    const messageText = decode(
      response.data.choices[0].message?.content,
      string
    );
    return messageText;
  }
}
