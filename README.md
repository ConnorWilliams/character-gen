# Character Generator

This is a project that creates an application which generates characters. Whether the character is real, fictional, human or non-human this API will let you chat to any character you can think of!

It uses OpenAI APIs to generate responses for your characters.

It is built completely with AWS Serverless - API Gateway, Lambda, DynamoDB

All with infrastructure as code using CDK.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run test:[unit | integration | endToEnd]`    perform the jest tests
* `npm run deploy`      deploy this stack to your default AWS account/region
* `npx cdk diff`        compare deployed stack with current state
* `npx cdk synth`       emits the synthesized CloudFormation template


## Deployment

1. Clone the repository
2. Run `npm ci`
3. Set your AWS config/ credentials
4. Set required environment variables: `DEPLOY_STAGE`
5. Run `npm run deploy`


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