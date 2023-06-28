# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## Approach

- Use all AWS serverless: API GW and Lambda
- Use typescript for everything possible: Infrastructure as Code with CDK, Backend with Node, Frontend with React/ Vue
- Design first - build API spec for creating characters, starting chats, and replying
- Write unit tests for controllers
- Write functionality for controllers
- Write CDK unti tests
- Write CDK infrastructure
- Write integration & end-to-end tests
- Deploy