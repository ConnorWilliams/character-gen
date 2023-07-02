import { ChatsController } from "../../src/controllers/chats-controller";
import { CharactersController } from "../../src/controllers/characters-controller";
import { v4 as uuidv4 } from "uuid";

describe("chat controller", () => {
  let chatsController: ChatsController;
  let charactersController: CharactersController;
  const userId = uuidv4();

  beforeEach(() => {
    chatsController = new ChatsController();
    charactersController = new CharactersController();
  });

  describe("starts a chat", () => {
    it("starts a chat", async () => {
      const createCharacterResponse = await createCharacter(
        charactersController,
        userId
      );
      expect(createCharacterResponse.statusCode).toEqual(200);
      const createChatResponse = await chatsController.createChat({
        requestContext: {
          authorizer: {
            claims: {
              sub: userId,
            },
          },
        },
        body: JSON.stringify({
          characterId: JSON.parse(createCharacterResponse.body).characterId,
        }),
      } as any);
      expect(createChatResponse.statusCode).toEqual(200);
    });
  });

  describe("send message", () => {
    it("sends a message", async () => {
      const createCharacterResponse = await createCharacter(
        charactersController,
        userId
      );
      expect(createCharacterResponse.statusCode).toEqual(200);

      const createChatResponse = await createChat(
        chatsController,
        userId,
        JSON.parse(createCharacterResponse.body).characterId
      );
      expect(createChatResponse.statusCode).toEqual(200);

      const sendMessageResponse = await chatsController.sendMessage({
        requestContext: {
          authorizer: {
            claims: {
              sub: userId,
            },
          },
        },
        pathParameters: {
          chatId: JSON.parse(createChatResponse.body).chatId,
        },
        body: JSON.stringify({
          message: "test message",
        }),
      } as any);
      expect(sendMessageResponse.statusCode).toEqual(200);
    });
  });
});

async function createCharacter(
  charactersController: CharactersController,
  userId: string
) {
  return await charactersController.createCharacter({
    requestContext: {
      authorizer: {
        claims: {
          sub: userId,
        },
      },
    },
    body: JSON.stringify({
      name: "testCharacterName",
      description: "test description",
      properties: [
        {
          name: "life_goal",
          value: "test life goal",
        },
      ],
    }),
  } as any);
}

async function createChat(
  chatsController: ChatsController,
  userId: string,
  characterId: string
) {
  return await chatsController.createChat({
    requestContext: {
      authorizer: {
        claims: {
          sub: userId,
        },
      },
    },
    body: JSON.stringify({
      characterId: characterId,
    }),
  } as any);
}
