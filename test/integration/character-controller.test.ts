import { v4 as uuidv4 } from "uuid";
import { CharactersController } from "../../src/controllers/characters-controller";
import { Character } from "../../src/data/dto";

describe("character controller", () => {
  let charactersController: CharactersController;

  beforeEach(() => {
    charactersController = new CharactersController();
  });

  describe("create a character", () => {
    it("creates a character", async () => {
      const createCharacterResponse =
        await charactersController.createCharacter({
          requestContext: {
            authorizer: {
              claims: {
                sub: uuidv4(),
              },
            },
          },
          body: JSON.stringify({
            name: "testCharacterName",
            description: "test description",
            properties: {
              life_goal: "test life goal",
            },
          }),
        } as any);
      expect(createCharacterResponse.statusCode).toEqual(200);
      expect(JSON.parse(createCharacterResponse.body)).toMatchObject<Character>(
        {
          characterId: expect.any(String),
          userId: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          properties: {
            life_goal: "test life goal",
          },
          numberOfConversations: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }
      );
    });
  });

  describe("get characters", () => {
    it("gets all characters owned by a user", async () => {
      const getCharacterResponse = await charactersController.getCharacters({
        requestContext: {
          authorizer: {
            claims: {
              sub: "5c6182b6-e426-4ea4-b8fa-5a88c66898de",
            },
          },
        },
      } as any);
      expect(getCharacterResponse.statusCode).toEqual(200);
    });
  });
});
