import { v4 as uuidv4 } from "uuid";
import { CharactersController } from "../../src/controllers/characters-controller";

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
            properties: [
              {
                name: "life_goal",
                value: "test life goal",
              },
            ],
          }),
        } as any);
      expect(createCharacterResponse.statusCode).toEqual(200);
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
