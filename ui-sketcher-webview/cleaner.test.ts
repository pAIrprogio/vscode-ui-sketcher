import { describe, it, expect } from "vitest";

/**
 * This file is used to dev the cleaner function
 * from the extension
 *
 * We put it in webview because vitest is easier to use
 * than mocha
 */

const ouputs = [
  "``",
  "`html",
  "\n  <div></div>",
  "\n  <plop>\n",
  "``` trash\nplop",
];

const START_QUOTE_REGEX = /```\w*\n/;
const PARTIAL_END_QUOTE = /\n`{0,3}/;
const END_QUOTE_REGEX = /\n```.*/s;

function* cleaner() {
  let hasCodeStarted = false;
  let buffer = "";

  for (const line of ouputs) {
    buffer += line;

    // We want to strip everything but the code
    if (!hasCodeStarted) {
      hasCodeStarted = START_QUOTE_REGEX.test(buffer);

      if (hasCodeStarted) {
        if (buffer.length > 0) {
          const code = buffer.replace(START_QUOTE_REGEX, "");
          yield code;
        }
        buffer = "";
      }

      continue;
    }

    if (PARTIAL_END_QUOTE.test(buffer)) {
      if (END_QUOTE_REGEX.test(buffer)) {
        const code = buffer.replace(END_QUOTE_REGEX, "");
        yield code;
        break;
      }

      // If full end quote, stop quoting
      continue;
    }

    yield buffer;
    buffer = "";
  }
}

describe("cleaner", () => {
  it("should remove code blocks", () => {
    const cleaned = [...cleaner()];
    expect(cleaned).toEqual(["  <div></div>", "\n  <plop>"]);
  });
});
