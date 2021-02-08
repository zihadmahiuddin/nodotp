import crypto from "crypto";

import ByteBuffer from "bytebuffer";
import { decode } from "hi-base32";

export default class PasscodeGenerator {
  static MAX_PASSCODE_LENGTH = 9;
  static PASS_CODE_LENGTH = 6;
  static ADJACENT_INTERVALS = 1;

  static DIGITS_POWER = [
    1,
    10,
    100,
    1000,
    10000,
    100000,
    1000000,
    10000000,
    100000000,
    1000000000,
  ];

  private hmac: crypto.Hmac;

  constructor(
    secret: string,
    public passCodeLength = PasscodeGenerator.PASS_CODE_LENGTH
  ) {
    if (
      passCodeLength < 0 ||
      passCodeLength > PasscodeGenerator.MAX_PASSCODE_LENGTH
    ) {
      throw new Error(
        "PassCodeLength must be between 1 and " +
          PasscodeGenerator.MAX_PASSCODE_LENGTH +
          " digits."
      );
    }

    this.hmac = crypto.createHmac(
      "sha1",
      Buffer.from(decode.asBytes(secret.toUpperCase()))
    );
  }

  private padOutput(value: number) {
    let result = value.toString();
    for (let i = result.length; i < this.passCodeLength; i++) {
      result = "0" + result;
    }
    return result;
  }

  generateResponseCode(
    stateOrChallenge: number | ByteBuffer,
    challenge?: ByteBuffer
  ) {
    if (typeof stateOrChallenge === "number") {
      if (typeof challenge !== "undefined") {
        const value = ByteBuffer.allocate(8 + challenge.capacity())
          .writeInt64(stateOrChallenge)
          .writeBytes(challenge);
        return this.generateResponseCode(value);
      } else {
        const value = ByteBuffer.allocate(8).writeInt64(stateOrChallenge);
        return this.generateResponseCode(value);
      }
    } else {
      const hash = this.hmac.update(stateOrChallenge.buffer).digest();
      const offset = hash[hash.length - 1] & 0xf;
      const truncatedHash = hash.readInt32BE(offset) & 0x7fffffff;
      const pinValue =
        truncatedHash % PasscodeGenerator.DIGITS_POWER[this.passCodeLength];
      return this.padOutput(pinValue);
    }
  }
}
