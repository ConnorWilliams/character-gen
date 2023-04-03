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

const API_URL = process.env.API_URL;

const setupCognitoUser = () => {};

describe("Chats API", () => {
  let jwt: string;
  const username = `connor_williams+testuser-${DEPLOY_STAGE}@msn.com`;
  const testpassword = "ThisIsMy1stTestPassword@";
  const userpoolClientName = `e2etest${DEPLOY_STAGE}`;
  const cognitoClient = new CognitoIdentityProviderClient({});

  beforeAll(async () => {
    const user = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        TemporaryPassword: testpassword,
        MessageAction: "SUPPRESS",
      })
    );
    const cognitoUserPoolClient = await cognitoClient.send(
      new CreateUserPoolClientCommand({
        UserPoolId: USER_POOL_ID,
        ClientName: userpoolClientName,
        ExplicitAuthFlows: [
          "ALLOW_ADMIN_USER_PASSWORD_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
      })
    );

    let initiateAuthResponse = await cognitoClient.send(
      new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: user.User?.Username || username,
          PASSWORD: testpassword,
        },
      })
    );

    if (initiateAuthResponse.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      const setNewPasswordResponse = await cognitoClient.send(
        new AdminRespondToAuthChallengeCommand({
          UserPoolId: USER_POOL_ID,
          ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
          ChallengeName: "NEW_PASSWORD_REQUIRED",
          ChallengeResponses: {
            USERNAME: user.User?.Username || username,
            NEW_PASSWORD: testpassword,
          },
          Session: initiateAuthResponse.Session || "",
        })
      );

      initiateAuthResponse = await cognitoClient.send(
        new AdminInitiateAuthCommand({
          UserPoolId: USER_POOL_ID,
          ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
          AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
          AuthParameters: {
            USERNAME: user.User?.Username || username,
            PASSWORD: testpassword,
          },
        })
      );
    }

    jwt = `${initiateAuthResponse.AuthenticationResult?.IdToken}`;
  });

  afterAll(async () => {
    cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      })
    );
    cognitoClient.send(
      new DeleteUserPoolClientCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: userpoolClientName,
      })
    );
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
    });

    it("returns 40X if no token is supplied", async () => {
      const getChatsResponse = await axios.get(`${API_URL}/chat`, {
        validateStatus: () => true,
      });
      expect(getChatsResponse.status).toEqual(401);
    });
  });
});
