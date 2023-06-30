import { ChatsController } from "../../src/controllers/chats-controller";
import { Character, Chat, Message, MessageResponse } from "../../src/data/dto";
import { CharacterService } from "../../src/services/character-service";
import { v4 as uuidv4 } from "uuid";
import Substitute, { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Log } from "../../src/utils/logger";
import { getTestCharacter, getTestChat } from "../utils/fixture-generators";
import { get } from "http";
import { ChatService } from "../../src/services/chat-service";
import { CharacterNotFoundError } from "../../src/utils/errors";
import { ChatStore } from "../../src/data/chat-store";

describe("chat controller", () => {
  let characterService: SubstituteOf<CharacterService>;
  let chatStore: SubstituteOf<ChatStore>;
  let chatService: ChatService;
  let httpController: ChatsController;
  const exampleUserId: string = uuidv4();
  const exampleCharacterId: string = "exampleCharacterId";

  beforeEach(() => {
    characterService = Substitute.for<CharacterService>();
    chatStore = Substitute.for<ChatStore>();
    chatService = new ChatService(chatStore, characterService);
    httpController = new ChatsController(chatService);
  });

  describe("create chat", () => {
    it("returns 200 and a new chat", async () => {
      const exampleChat: Chat = getTestChat();
      chatStore.createChat(Arg.all()).resolves(exampleChat);
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
          name: expect.any(String),
          text: expect.any(String),
          timestamp: expect.any(String),
        },
        response: {
          name: expect.any(String),
          text: expect.any(String),
          timestamp: expect.any(String),
        },
      });
    });
  });
});
