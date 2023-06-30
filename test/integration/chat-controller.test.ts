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
      const createCharacterResponse =
        await charactersController.createCharacter({
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
});
