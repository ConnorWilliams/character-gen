import { ChatsController } from "../../src/controllers/chats-controller";
import { CharactersController } from "../../src/controllers/characters-controller";

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
    });

    describe("Tries to get started with a character", () => {
      let characterId: string;

      it("creates a character", async () => {
        const createCharacterResponse =
          await charactersController.createCharacter({
            requestContext: {
              authorizer: {
                claims: {
                  sub: "123",
                },
              },
            },
            body: JSON.stringify({
              name: "Test Character",
              description: "Test Character Description",
              properties: [
                {
                  name: "Test Property",
                  value: "Test Property Value",
                },
              ],
            }),
          } as any);
        expect(createCharacterResponse.statusCode).toEqual(200);
        const serializedCharacter = JSON.parse(createCharacterResponse.body);
        console.log(serializedCharacter);
        expect(serializedCharacter.character.characterId).toBeTruthy();
        expect(serializedCharacter.character.name).toEqual("Test Character");
        expect(serializedCharacter.character.properties).toEqual([
          {
            name: "Test Property",
            value: "Test Property Value",
          },
        ]);
        characterId = JSON.parse(createCharacterResponse.body).character
          .characterId;
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
            character_id: characterId,
          }),
        } as any);
        expect(createChatResponse.statusCode).toEqual(200);

        const serializedChat = JSON.parse(createChatResponse.body);
        expect(serializedChat.chat.chatId).toBeTruthy();
        expect(serializedChat.chat.character).toBeTruthy();
        expect(serializedChat.chat.character).toMatchObject({
          characterId: characterId,
          name: "Test Character",
          description: "Test Character Description",
          properties: [
            {
              name: "Test Property",
              value: "Test Property Value",
            },
          ],
        });
        expect(serializedChat.chat.messages).toEqual([]);
      });
    });
  });
});
