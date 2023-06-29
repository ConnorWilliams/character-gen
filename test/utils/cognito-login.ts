import {
  AdminCreateUserCommand,
  CreateUserPoolClientCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  DeleteUserPoolClientCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

export const createCognitoUserAndLogin = async (
  email: string,
  password: string,
  userpoolId: string,
  userpoolClientName: string = "test-userpool-client"
) => {
  const cognitoClient = new CognitoIdentityProviderClient({});

  const user = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: userpoolId,
      Username: email,
      TemporaryPassword: password,
      MessageAction: "SUPPRESS",
    })
  );
  const cognitoUserPoolClient = await cognitoClient.send(
    new CreateUserPoolClientCommand({
      UserPoolId: userpoolId,
      ClientName: userpoolClientName,
      ExplicitAuthFlows: [
        "ALLOW_ADMIN_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
    })
  );
  const cognitoUserPoolClientId =
    cognitoUserPoolClient.UserPoolClient?.ClientId || "";

  let initiateAuthResponse = await cognitoClient.send(
    new AdminInitiateAuthCommand({
      UserPoolId: userpoolId,
      ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: user.User?.Username || email,
        PASSWORD: password,
      },
    })
  );

  if (initiateAuthResponse.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    const setNewPasswordResponse = await cognitoClient.send(
      new AdminRespondToAuthChallengeCommand({
        UserPoolId: userpoolId,
        ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ChallengeResponses: {
          USERNAME: user.User?.Username || email,
          NEW_PASSWORD: password,
        },
        Session: initiateAuthResponse.Session || "",
      })
    );

    initiateAuthResponse = await cognitoClient.send(
      new AdminInitiateAuthCommand({
        UserPoolId: userpoolId,
        ClientId: cognitoUserPoolClient.UserPoolClient?.ClientId || "",
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: user.User?.Username || email,
          PASSWORD: password,
        },
      })
    );
  }

  cognitoClient.send(
    new DeleteUserPoolClientCommand({
      UserPoolId: userpoolId,
      ClientId: cognitoUserPoolClientId,
    })
  );

  return `${initiateAuthResponse.AuthenticationResult?.IdToken}`;
};
