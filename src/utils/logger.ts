import { Logger } from "@aws-lambda-powertools/logger";

export const Log = new Logger({
  serviceName: "charactergen-api",
  logLevel: process.env.LOG_LEVEL,
});
