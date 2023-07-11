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
  const username = `cojwilliams+testuser-${DEPLOY_STAGE}@gmail.com`;
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
          properties: {
            life_goal: "test life goal",
          },
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

    it("returns 400 if a required property is missing", async () => {
      const createCharacterResponse = await axios.post(
        `${API_URL}/character`,
        {
          name: "Test Character",
          description: "Test Description",
          properties: {},
        },
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      expect(createCharacterResponse.status).toEqual(400);
      expect(createCharacterResponse).toSatisfyApiSpec();
    });

    it("returns 401 if no JWT is supplied", async () => {
      const createCharacterResponse = await axios.post(
        `${API_URL}/character`,
        {
          name: "Test Character",
          description: "Test Description",
          properties: {
            life_goal: "test life goal",
          },
        },
        {
          validateStatus: () => true,
        }
      );
      expect(createCharacterResponse.status).toEqual(401);
      expect(createCharacterResponse).toSatisfyApiSpec();
    });
  });

  describe("Get characters", () => {
    it("returns 200 and a list of characters", async () => {
      const getCharacterResponse = await axios.get(`${API_URL}/character`, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      expect(getCharacterResponse.status).toEqual(200);
      expect(getCharacterResponse).toSatisfyApiSpec();
    });
  });
});
