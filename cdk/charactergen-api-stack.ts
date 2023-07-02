import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { CfnUserPoolUser, UserPool } from "aws-cdk-lib/aws-cognito";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ApiLambda, TablePermissions } from "./constructs/api-lambda";

const stageName = `dev`; // TODO: Make dynamic

interface CharactergenApiStackProps extends StackProps {
  readonly stageName: string;
}

export class CharactergenApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: CharactergenApiStackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      userPoolName: "CharacterGenUserPool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    new CfnUserPoolUser(this, "AdminUserPoolUser", {
      userPoolId: userPool.userPoolId,
      username: `connor_williams+adminuser-${stageName}@msn.com`,
    });

    const authorizer = new CognitoUserPoolsAuthorizer(this, "Authorizer", {
      cognitoUserPools: [userPool],
    });

    const chatTable = new Table(this, `ChatTable`, {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const api = new RestApi(this, "CharacterGenApi", {
      deployOptions: {
        stageName: stageName,
      },
    });
    api.root.addMethod("ANY");
    const chats = api.root.addResource("chat");
    const chat = chats.addResource("{chatId}");
    const characters = api.root.addResource("character");
    const character = characters.addResource("{characterId}");

    // Get Chats
    const getChatsHandler = new ApiLambda(this, `GetChatsFunction`, {
      functionName: `GetChats`,
      functionDescription: `Gets all chats`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `getChats`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`read`]]]),
    });

    const getChatsIntegration = new LambdaIntegration(getChatsHandler.function);

    chats.addMethod("GET", getChatsIntegration, {
      operationName: `GetChats`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Start Chat
    const startChatHandler = new ApiLambda(this, `StartChatFunction`, {
      functionName: `StartChat`,
      functionDescription: `Starts a chat with your new character`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `startChat`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`write`, `read`]]]),
    });
    const startChatIntegration = new LambdaIntegration(
      startChatHandler.function
    );

    chats.addMethod("POST", startChatIntegration, {
      operationName: `StartChat`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Get Chat
    const getChatHandler = new ApiLambda(this, `GetChatFunction`, {
      functionName: `GetChat`,
      functionDescription: `Gets a chat messages`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `getChat`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`read`]]]),
    });
    const getChatIntegration = new LambdaIntegration(getChatHandler.function);

    chat.addMethod("GET", getChatIntegration, {
      operationName: `GetChat`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Post Message
    const postMessageHandler = new ApiLambda(this, `PostMessageFunction`, {
      functionName: `PostMessage`,
      functionDescription: `Posts a message to a chat`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `replyToChat`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`write`, `read`]]]),
    });

    const postMessageIntegration = new LambdaIntegration(
      postMessageHandler.function
    );

    chat.addMethod("POST", postMessageIntegration, {
      operationName: `PostMessage`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Delete Chat
    const deleteChatHandler = new ApiLambda(this, `DeleteChatFunction`, {
      functionName: `DeleteChat`,
      functionDescription: `Deletes a chat`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `deleteChat`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`write`]]]),
    });

    const deleteChatIntegration = new LambdaIntegration(
      deleteChatHandler.function
    );

    chat.addMethod("DELETE", deleteChatIntegration, {
      operationName: `DeleteChat`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Get Characters
    const getCharactersHandler = new ApiLambda(this, `GetCharactersFunction`, {
      functionName: `GetCharacters`,
      functionDescription: `Gets all characters`,
      functionEntry: `dist/src/characters-handler.js`,
      functionHandler: `getCharacters`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`read`]]]),
    });

    const getCharactersIntegration = new LambdaIntegration(
      getCharactersHandler.function
    );

    characters.addMethod("GET", getCharactersIntegration, {
      operationName: `GetCharacters`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Get Character
    const getCharacterHandler = new ApiLambda(this, `GetCharacterFunction`, {
      functionName: `GetCharacter`,
      functionDescription: `Gets a character`,
      functionEntry: `dist/src/characters-handler.js`,
      functionHandler: `getCharacter`,
      stageName: stageName,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`read`]]]),
    });

    const getCharacterIntegration = new LambdaIntegration(
      getCharacterHandler.function
    );

    character.addMethod("GET", getCharacterIntegration, {
      operationName: `GetCharacter`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // Create Character
    const createCharacterHandler = new ApiLambda(
      this,
      `CreateCharacterFunction`,
      {
        functionName: `CreateCharacter`,
        functionDescription: `Creates a character`,
        functionEntry: `dist/src/characters-handler.js`,
        functionHandler: `createCharacter`,
        stageName: stageName,
        environment: {
          CHAT_TABLE_NAME: chatTable.tableName,
        },
        tablePermissions: new TablePermissions([[chatTable, [`write`]]]),
      }
    );

    const createCharacterIntegration = new LambdaIntegration(
      createCharacterHandler.function
    );

    characters.addMethod("POST", createCharacterIntegration, {
      operationName: `CreateCharacter`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });
  }
}
