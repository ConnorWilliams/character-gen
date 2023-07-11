import { CharactersController } from "../../src/controllers/characters-controller";
import { Character } from "../../src/data/dto";
import { CharacterService } from "../../src/services/character-service";
import { v4 as uuidv4 } from "uuid";
import Substitute, { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { getTestCharacter } from "../utils/fixture-generators";

describe("characters controller", () => {
  let characterService: SubstituteOf<CharacterService>;
  let httpController: CharactersController;
  const exampleUserId: string = uuidv4();
  const exampleCharacterId: string = "exampleCharacterId";

  beforeEach(() => {
    characterService = Substitute.for<CharacterService>();
    httpController = new CharactersController(characterService);
  });

  describe("create character", () => {
    it("returns 200 and character when successful", async () => {
      const exampleCharacter: Character = getTestCharacter();
      characterService.createCharacter(Arg.all()).resolves(exampleCharacter);
      const response = await httpController.createCharacter({
        requestContext: {
          authorizer: {
            claims: {
              sub: 1,
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
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject<Character>(
        exampleCharacter
      );
    });

    it("returns 400 and useful error message when missing required properties", async () => {
      const exampleCharacter: Character = getTestCharacter({ properties: {} });
      characterService.createCharacter(Arg.all()).resolves(exampleCharacter);
      const response = await httpController.createCharacter({
        requestContext: {
          authorizer: {
            claims: {
              sub: 1,
            },
          },
        },
        body: JSON.stringify({
          name: "testCharacterName",
          description: "test description",
          properties: {
            age: "20",
          },
        }),
      } as any);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.body)).toMatchObject({
        error_description: "Missing required properties: life_goal.",
      });
    });
  });

  describe("get characters", () => {
    it("returns 200 and a list of character when successful", async () => {
      const exampleCharacters = [getTestCharacter(), getTestCharacter()];

      characterService.getCharacters(Arg.all()).resolves(exampleCharacters);

      const response = await httpController.getCharacters({
        requestContext: {
          authorizer: {
            claims: {
              sub: 1,
            },
          },
        },
      } as any);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify(exampleCharacters));
    });
  });
});
