import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ApiLambda, TablePermissions } from "./constructs/api-lambda";

export class CharactergenApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
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

    const api = new RestApi(this, "CharacterGenApi", {});
    api.root.addMethod("ANY");

    const getChatsHandler = new ApiLambda(this, `GetChatsFunction`, {
      functionName: `GetChats`,
      functionDescription: `Gets all chats`,
      functionEntry: `dist/src/chats-handler.js`,
      functionHandler: `getChats`,
      stageName: `dev`,
      environment: {
        CHAT_TABLE_NAME: chatTable.tableName,
      },
      tablePermissions: new TablePermissions([[chatTable, [`read`, `write`]]]),
    });

    const getChatsIntegration = new LambdaIntegration(getChatsHandler.function);

    const chats = api.root.addResource("chat");

    chats.addMethod("GET", getChatsIntegration, {
      operationName: `GetChats`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer,
    });
    chats.addMethod("POST");

    const chat = chats.addResource("{chatId}");
    chat.addMethod("GET", undefined, {
      operationName: `GetChat`,
    });
    chat.addMethod("POST", undefined, {
      operationName: `PostMessage`,
    });
    chat.addMethod("DELETE", undefined, {
      operationName: `DeleteChat`,
    });
  }
}
