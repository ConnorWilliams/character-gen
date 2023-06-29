#!/usr/bin/env node
import { App, AppProps } from "aws-cdk-lib";
import { CharactergenApiStack } from "./charactergen-api-stack";
import { Env, getEnvConfig } from "./env";
import { narrowOrThrow } from "../src/utils/narrow-or-throw";

const stageName = narrowOrThrow<string>(
  process.env.DEPLOY_STAGE,
  "Expected to receive DEPLOY_STAGE environment variable."
).toLowerCase();

interface MyAppProps extends AppProps {
  readonly envConfig: Env;
}

const envConfig = getEnvConfig(stageName);

class MyApp extends App {
  constructor(props: MyAppProps) {
    super();
    this.node.setContext("envConfig", props.envConfig);
  }
}

const app = new MyApp({
  envConfig,
});

new CharactergenApiStack(app, "CharactergenApiStack", { stageName });
