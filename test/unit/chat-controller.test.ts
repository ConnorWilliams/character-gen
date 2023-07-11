import { ChatsController } from "../../src/controllers/chats-controller";
import { Chat, MessageResponse } from "../../src/data/dto";
import { CharacterService } from "../../src/services/character-service";
import { v4 as uuidv4 } from "uuid";
import Substitute, { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { getTestChat } from "../utils/fixture-generators";
import { ChatService } from "../../src/services/chat-service";
import { CharacterNotFoundError } from "../../src/utils/errors";
import { ChatStore } from "../../src/data/chat-store";
import { OpenAiService } from "../../src/services/openai-service";

describe("chat controller", () => {
  let characterService: SubstituteOf<CharacterService>;
  let chatStore: SubstituteOf<ChatStore>;
  let openAiService: SubstituteOf<OpenAiService>;
  let chatService: ChatService;
  let httpController: ChatsController;
  const exampleUserId: string = uuidv4();

  beforeEach(() => {
    characterService = Substitute.for<CharacterService>();
    chatStore = Substitute.for<ChatStore>();
    openAiService = Substitute.for<OpenAiService>();
    chatService = new ChatService(chatStore, characterService, openAiService);
    httpController = new ChatsController(chatService);
  });

  describe("create chat", () => {
    it("returns 200 and a new chat", async () => {
      const exampleChat: Chat = getTestChat();
      chatStore.createChat(Arg.all()).resolves(exampleChat);
      openAiService
        .startChat(Arg.all())
        .resolves(`Hello it's me your character. How can I help you today?`);
      const response = await httpController.createChat({
        requestContext: {
          authorizer: {
            claims: {
              sub: exampleUserId,
            },
          },
        },
        body: JSON.stringify({
          characterId: "exampleCharacterId",
        }),
      } as any);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject<Chat>(exampleChat);
    });

    it("returns 404 and a useful error for character not found", async () => {
      characterService
        .incrementNumberOfChats(Arg.all())
        .throws(new CharacterNotFoundError("Can't find character."));
      const response = await httpController.createChat({
        requestContext: {
          authorizer: {
            claims: {
              sub: exampleUserId,
            },
          },
        },
        body: JSON.stringify({
          characterId: "nonExistentCharacterId",
        }),
      } as any);
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("get chats", () => {
    it("returns 200 and a list of chats when successful", async () => {
      const exampleChat: Chat = getTestChat();
      chatStore.getChats(Arg.all()).resolves([exampleChat]);
      const response = await httpController.getChats({
        requestContext: {
          authorizer: {
            claims: {
              sub: exampleUserId,
            },
          },
        },
      } as any);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject<Chat[]>([exampleChat]);
    });
  });

  describe("get chat", () => {
    it("returns 200 and a chat when successful", async () => {
      const exampleChat: Chat = getTestChat();
      chatStore.getChat(Arg.all()).resolves(exampleChat);
      const response = await httpController.getChat({
        requestContext: {
          authorizer: {
            claims: {
              sub: exampleUserId,
            },
          },
        },
        pathParameters: {
          chatId: "exampleChatId",
        },
      } as any);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject<Chat>(exampleChat);
    });
  });

  describe("send message", () => {
    it("returns 200 and a reply when successful", async () => {
      const exampleChat: Chat = getTestChat();
      chatStore.addMessageToChat(Arg.all()).resolves(exampleChat);
      openAiService
        .getReply(Arg.all())
        .resolves(
          `This is me, your character, responding to your intelligent and funny message.`
        );
      const response = await httpController.sendMessage({
        requestContext: {
          authorizer: {
            claims: {
              sub: exampleUserId,
            },
          },
        },
        pathParameters: {
          chatId: "exampleChatId",
        },
        body: JSON.stringify({
          message: "test message",
        }),
      } as any);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject<MessageResponse>({
        message: {
          id: expect.any(String),
          content: expect.any(String),
          role: expect.any(String),
          timestamp: expect.any(String),
        },
        response: {
          id: expect.any(String),
          content: expect.any(String),
          role: expect.any(String),
          timestamp: expect.any(String),
        },
      });
    });
  });
});
