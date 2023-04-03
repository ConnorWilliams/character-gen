import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const DDB_READ = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"];
export const DDB_WRITE = [
  "dynamodb:PutItem",
  "dynamodb:UpdateItem",
  "dynamodb:DeleteItem",
  "dynamodb:BatchWriteItem",
];

export class PolicyService {
  public static getInstance(): PolicyService {
    return new PolicyService();
  }

  public getKmsDecryptStatement(keyArn: string): PolicyStatement {
    return new PolicyStatement({
      sid: "AllowAccessToTenantKMS",
      effect: Effect.ALLOW,
      actions: ["kms:DescribeKey", "kms:Decrypt"],
      resources: [keyArn],
    });
  }
  public getKmsEncryptStatement(keyArn: string): PolicyStatement {
    return new PolicyStatement({
      sid: "AllowAccessToEncryptTenantKMS",
      effect: Effect.ALLOW,
      actions: ["kms:GenerateDataKey", "kms:Encrypt"],
      resources: [keyArn],
    });
  }

  public getXrayStatement(): PolicyStatement {
    return new PolicyStatement({
      sid: "AllowXRay",
      effect: Effect.ALLOW,
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
    });
  }

  public getSecretsReadStatement(secretArns: string[]): PolicyStatement {
    return new PolicyStatement({
      sid: "AllowReadSecrets",
      effect: Effect.ALLOW,
      actions: [
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds",
      ],
      resources: secretArns,
    });
  }

  public getDynamoReadStatement(
    tableArn: string,
    sid = "AllowDynamoDbRead"
  ): PolicyStatement {
    return new PolicyStatement({
      sid,
      effect: Effect.ALLOW,
      actions: ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"],
      resources: [tableArn, `${tableArn}/index/*`],
    });
  }

  public getDynamoWriteStatement(
    tableArn: string,
    sid = "AllowDynamoDbWrite"
  ): PolicyStatement {
    return new PolicyStatement({
      sid,
      effect: Effect.ALLOW,
      actions: [
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchWriteItem",
      ],
      resources: [tableArn],
    });
  }
}
