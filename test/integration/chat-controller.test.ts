import { ChatsController } from "../../src/controllers/chats-controller";
import { CharactersController } from "../../src/controllers/characters-controller";
import { ChatService } from "../../src/services/chat-service";

describe("chat controller", () => {
  let chatsController: ChatsController;
  let charactersController: CharactersController;

  beforeEach(() => {
    chatsController = new ChatsController();
    charactersController = new CharactersController();
  });

  describe("get chats", () => {
    it("gets all chats", async () => {
      const getChatsResponse = await chatsController.getChats({
        requestContext: {
          authorizer: {
            claims: {
              sub: "123",
            },
          },
        },
      } as any);
      expect(getChatsResponse.statusCode).toEqual(200);
      expect(JSON.parse(getChatsResponse.body)).toEqual({
        chats: "[]",
      });
    });
  });

  describe("When a user", () => {
    describe("Tries to get a chat that doesn't exist", () => {
      it("returns 404", async () => {
        const getChatResponse = await chatsController.getChat({
          requestContext: {
            authorizer: {
              claims: {
                sub: "123",
              },
            },
          },
          pathParameters: {
            chatId: "123",
          },
        } as any);
        expect(getChatResponse.statusCode).toEqual(404);
      });
    }
    );

    describe("Tries to get started with a character", () => {
      let characterId: string;

      it("creates a character", async () => {
        const createCharacterResponse = await charactersController.createCharacter({
          requestContext: {
            authorizer: {
              claims: {
                sub: "123",
              },
            },
          },
          body: JSON.stringify({
            name: "Test Character",
            life_goal: "Test Life Goal",
          })
        } as any);
        expect(createCharacterResponse.statusCode).toEqual(200);
        characterId = JSON.parse(createCharacterResponse.body).character.characterId;
      });

      it("lists all characters", async () => {
        const getCharactersResponse = await charactersController.getCharacters({
          requestContext: {
            authorizer: {
              claims: {
                sub: "123",
              },
            },
          },
        } as any);
        expect(getCharactersResponse.statusCode).toEqual(200);
        console.log(JSON.parse(getCharactersResponse.body));
      });

      it("creates a chat", async () => {
        const createChatResponse = await chatsController.createChat({
          requestContext: {
            authorizer: {
              claims: {
                sub: "123",
              },
            },
          },
          body: JSON.stringify({
            character_id: 'character#19f09ef7-1ac6-4cdb-a27e-ec63b40cd560',
          })
        } as any);
        expect(createChatResponse.statusCode).toEqual(200);
      });
    });
  });
});
