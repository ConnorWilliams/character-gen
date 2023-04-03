import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { kebabCase, pascalCase } from "../../src/utils/cases";
import { DDB_READ, DDB_WRITE } from "../services/policy-service";

export class TablePermissions extends Map<Table, Array<`read` | `write`>> {}

export interface ApiLambdaProps {
  stageName: string;
  functionName: string;
  functionDescription: string;
  functionEntry: string;
  functionHandler: string;
  environment: { [key: string]: string };
  tablePermissions: TablePermissions;
}

export class ApiLambda extends Construct {
  public readonly function: NodejsFunction;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    this.function = new NodejsFunction(
      this,
      kebabCase(`${props.functionName}-${props.stageName}-function`),
      {
        functionName: kebabCase(`${props.functionName}-${props.stageName}`),
        description: props.functionDescription,
        entry: props.functionEntry,
        handler: props.functionHandler,
        memorySize: 128,
        logRetention: RetentionDays.ONE_DAY,
        environment: {
          DEPLOY_STAGE: props.stageName,
          ...props.environment,
        },
        runtime: Runtime.NODEJS_18_X,
        timeout: Duration.seconds(3),
      }
    );

    this.addDynamoPermissions(props.tablePermissions);
  }

  private addDynamoPermissions(ddbPermissions: TablePermissions) {
    for (const table of ddbPermissions.keys()) {
      const sid = `allow-${table.node.id}`;

      for (const permission of ddbPermissions.get(table)!) {
        this.function.addToRolePolicy(
          new PolicyStatement({
            sid: pascalCase(`${sid}-${permission}`),
            effect: Effect.ALLOW,
            actions: permission === `read` ? DDB_READ : DDB_WRITE,
            resources: [
              table.tableArn,
              permission === `read` && `${table.tableArn}/index/*`,
            ].filter(Boolean) as string[],
          })
        );
      }
    }
  }
}
