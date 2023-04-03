export const narrowOrThrow = <T>(
  toCheck: T | undefined | null,
  message: string
): T => {
  if (toCheck === null || toCheck === undefined) {
    throw new Error(message);
  }

  return toCheck;
};
