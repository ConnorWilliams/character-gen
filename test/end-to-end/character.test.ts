import axios from "axios";
import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { DEPLOY_STAGE, USER_POOL_ID } from "../utils/set-env-vars";
import jestOpenAPI from "jest-openapi";
import * as path from "path";
import { createCognitoUserAndLogin } from "../utils/cognito-login";

const API_URL = process.env.API_URL;
jestOpenAPI(path.resolve(__dirname, "./../../openapi.yaml"));

describe("Character API", () => {
  let jwt: string;
  const username = `connor_williams+testuser-${DEPLOY_STAGE}@msn.com`;
  const testpassword = "ThisIsMy1stTestPassword@";
  const userpoolClientName = `e2etest${DEPLOY_STAGE}`;
  const cognitoClient = new CognitoIdentityProviderClient({});

  beforeAll(async () => {
    jwt = await createCognitoUserAndLogin(
      username,
      testpassword,
      USER_POOL_ID,
      userpoolClientName
    );
  });

  afterAll(async () => {
    cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      })
    );
  });

  describe("Create character", () => {
    it("returns 200 and a character", async () => {
      const createCharacterResponse = await axios.post(
        `${API_URL}/character`,
        {
          name: "Test Character",
          description: "Test Description",
          properties: [
            {
              name: "life_goal",
              value: "test life goal",
            },
          ],
        },
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      expect(createCharacterResponse.status).toEqual(200);
      expect(createCharacterResponse).toSatisfyApiSpec();
    });

    it("returns 40X if a required property is missing", async () => {
      const createCharacterResponse = await axios.post(
        `${API_URL}/character`,
        {
          name: "Test Character",
          description: "Test Description",
          properties: [],
        },
        {
          validateStatus: () => true,
        }
      );
      expect(createCharacterResponse.status).toEqual(401);
      expect(createCharacterResponse).toSatisfyApiSpec();
    });

    it("returns 40X if no JWT is supplied", async () => {
      const createCharacterResponse = await axios.post(
        `${API_URL}/character`,
        {
          name: "Test Character",
          description: "Test Description",
          properties: [
            {
              name: "life_goal",
              value: "test life goal",
            },
          ],
        },
        {
          validateStatus: () => true,
        }
      );
      expect(createCharacterResponse.status).toEqual(401);
      expect(createCharacterResponse).toSatisfyApiSpec();
    });
  });
});
