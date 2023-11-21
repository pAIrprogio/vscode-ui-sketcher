import { describe, it, expect } from "vitest";

/**
 * This file is used to dev the cleaner function
 * from the extension
 *
 * We put it in webview because vitest is easier to use
 * than mocha
 */

const ouputs = [
  "A lot of stuff b",
  "efore``",
  "`html",
  "\n<1/>\n",
  "<2/>",
  "\n",
  "<3/>",
  "\n<4/>\n",
  "``` trash\nplop",
];

const START_QUOTE_REGEX = /```[^\n]*\n/;
const PARTIAL_END_QUOTE = /\n`{0,3}$/;
const FULL_END_QUOTE_REGEX = /\n```/;
const REMOVE_PREFIX_REGEX = /.*```[^\n]*\n/s;
const REMOVE_SUFFIX_REGEX = /\n```.*/s;

function* cleaner() {
  let hasCodeStarted = false;
  let buffer = "";

  for (const textChunk of ouputs) {
    buffer += textChunk;

    // We want to strip everything but the code
    if (!hasCodeStarted) {
      hasCodeStarted = START_QUOTE_REGEX.test(buffer);

      if (!hasCodeStarted) continue;

      buffer = buffer.replace(REMOVE_PREFIX_REGEX, "");
    }

    // Stop at full end quote
    if (FULL_END_QUOTE_REGEX.test(buffer)) {
      const code = buffer.replace(REMOVE_SUFFIX_REGEX, "");
      if (code !== "") yield code;
      break;
    }

    // Buffer if not a full end quote, but a partial one
    if (PARTIAL_END_QUOTE.test(buffer)) {
      const parts = buffer.split("\n");
      buffer = "\n" + parts.pop() || "";
      const code = parts.join("\n");
      if (code !== "") yield code;
      continue;
    }

    // Skip empty buffer
    if (buffer === "") continue;

    // Dump buffer
    yield buffer;
    buffer = "";
  }
}

describe("cleaner", () => {
  it("should remove code blocks", () => {
    const cleaned = [...cleaner()];
    expect(cleaned).toEqual(["<1/>", "\n<2/>", "\n<3/>", "\n<4/>"]);
  });
});
