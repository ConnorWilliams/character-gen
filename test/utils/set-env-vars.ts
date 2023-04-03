import { config } from "dotenv";
import * as path from "path";
import { Log } from "../../src/utils/logger";
import { narrowOrThrow } from "../../src/utils/narrow-or-throw";

const getDeployStage = (): string => {
  const deployStage = process.env.DEPLOY_STAGE;
  if (!deployStage) {
    Log.debug(`Defaulting DEPLOY_STAGE env var to dev...`);
    return "dev";
  } else {
    return deployStage.toLowerCase();
  }
};

config({
  path: path.join(__dirname, `../env/.env.${getDeployStage()}`),
});

export const DEPLOY_STAGE = getDeployStage();

export const API_URL = narrowOrThrow(
  process.env.API_URL,
  "Expected API_URL env var to be present."
);
export const USER_POOL_ID = narrowOrThrow(
  process.env.USER_POOL_ID,
  "Expected USER_POOL_ID env var to be present."
);
