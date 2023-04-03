#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { CharactergenApiStack } from "./charactergen-api-stack";

const app = new App();

new CharactergenApiStack(app, "CharactergenApiStack", {});
