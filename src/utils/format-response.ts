import { APIGatewayProxyResult } from "aws-lambda";

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export const formatResponse = (
  statusCode: number,
  body: JSONValue | "" = ""
): APIGatewayProxyResult => {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    body: JSON.stringify(body),
  };
};
