import { APIGatewayProxyResult } from "aws-lambda";

export const formatResponse = (
  statusCode: number,
  body: { [key: string]: string | number } | "" = ""
): APIGatewayProxyResult => {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    body: JSON.stringify(body),
  };
};
