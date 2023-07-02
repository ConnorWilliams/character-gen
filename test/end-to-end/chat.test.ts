import axios from "axios";
import {
  AdminCreateUserCommand,
  CreateUserPoolClientCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminDeleteUserCommand,
  DeleteUserPoolClientCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { DEPLOY_STAGE, USER_POOL_ID } from "../utils/set-env-vars";
import jestOpenAPI from "jest-openapi";
import * as path from "path";
import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { createCognitoUserAndLogin } from "../utils/cognito-login";
import { createCharacter, createChat } from "./utils";

const API_URL = process.env.API_URL;
jestOpenAPI(path.resolve(__dirname, "./../../openapi.yaml"));

describe("Chats API", () => {
  let jwt: string;
  const username = `connor_williams+testuser-${DEPLOY_STAGE}@gmail.com`;
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

  describe("Create chat", () => {
    it("returns 200 and a chat", async () => {
      const createCharacterResponse = await createCharacter(jwt);
      const createChatResponse = await axios.post(
        `${API_URL}/chat`,
        {
          characterId: createCharacterResponse.data.characterId,
        },
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      expect(createChatResponse.status).toEqual(200);
      expect(createChatResponse).toSatisfyApiSpec();
    });

    it("returns 404 if character does not exist", async () => {
      const createChatResponse = await axios.post(
        `${API_URL}/chat`,
        {
          characterId: "9999999",
        },
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      expect(createChatResponse.status).toEqual(404);
      expect(createChatResponse).toSatisfyApiSpec();
    });
  });

  describe("Reply to chat", () => {
    it("returns 200 and a response", async () => {
      const createCharacterResponse = await createCharacter(jwt);
      const createChatResponse = await createChat(
        jwt,
        createCharacterResponse.data.characterId
      );
      console.log(`Chat ID is: ${createChatResponse.data.chatId}`);
      const replyToChatResponse = await axios.post(
        `${API_URL}/chat/${createChatResponse.data.chatId}`,
        {
          message: "Test message",
        },
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      expect(replyToChatResponse.status).toEqual(200);
      expect(replyToChatResponse).toSatisfyApiSpec();
    });
  });

  describe("Get all chats", () => {
    it("returns 200 and list of chats", async () => {
      const getChatsResponse = await axios.get(`${API_URL}/chat`, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      expect(getChatsResponse.status).toEqual(200);
      expect(getChatsResponse).toSatisfyApiSpec();
    });

    it("returns 40X if no token is supplied", async () => {
      const getChatsResponse = await axios.get(`${API_URL}/chat`, {
        validateStatus: () => true,
      });
      expect(getChatsResponse.status).toEqual(401);
      expect(getChatsResponse).toSatisfyApiSpec();
    });
  });
});
