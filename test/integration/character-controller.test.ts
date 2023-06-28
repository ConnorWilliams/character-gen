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
});
