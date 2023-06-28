import { Decoder } from "io-ts";
import { fold } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";
import { DecodingError } from "./errors";
import { Log } from "./logger";

export const decode = <A>(input: unknown, decoder: Decoder<unknown, A>): A => {
  const decoded = decoder.decode(input);

  return fold(
    () => {
      throw new DecodingError(`${PathReporter.report(decoded).toString()}`);
    },
    (right: A) => right
  )(decoded);
};

export const decodeList = <A>(
  input: unknown[],
  decoder: Decoder<unknown, Array<A>>
): A[] => {
  const decoded = decoder.decode(input);

  return fold(
    () => {
      throw new DecodingError(`${PathReporter.report(decoded).toString()}`);
    },
    (right: A[]) => right
  )(decoded);
};

export const decodeNotThrow = <A>(
  input: unknown,
  decoder: Decoder<unknown, A>
): A | undefined => {
  const decoded = decoder.decode(input);

  return fold(
    () => {
      Log.warn(
        `Caught error decoding ${PathReporter.report(decoded).toString()}`
      );
      return undefined;
    },
    (right: A) => right
  )(decoded);
};
