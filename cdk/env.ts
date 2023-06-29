import { Log } from "../src/utils/logger";
import * as iots from "io-ts";

export const Env = iots.type({
  normalizedStage: iots.string,
  logLevel: iots.string,
});
export type Env = iots.TypeOf<typeof Env>;

interface EnvConfig {
  [stage: string]: Env;
}

export const getEnvConfig = (stage: string): Env => {
  const normalizedStage = ["dev", "tst", "acc", "stg", "prd"].includes(
    stage.toLowerCase()
  )
    ? stage
    : "dev";
  const dtaEnv: Env = {
    normalizedStage,
    logLevel: "DEBUG",
  };
  const prdEnv: Env = {
    normalizedStage,
    logLevel: "WARN",
  };
  const configs: EnvConfig = {
    dev: dtaEnv,
    prd: prdEnv,
  };
  const envConfig = configs[stage.toLowerCase()];
  if (!envConfig) {
    Log.warn(
      `No env config present for ${stage}. Substituting dev defaults...`
    );
    return configs.dev;
  } else {
    return envConfig;
  }
};
