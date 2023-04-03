/**
 * Default options provided to dynamoose models on instantiation. Flags are set to false as the tables already exist and dynamoose won't manage them.
 */
export const DYNAMOOSE_DEFAULT_OPTIONS = {
  create: false,
  waitForActive: false,
  update: false,
};
