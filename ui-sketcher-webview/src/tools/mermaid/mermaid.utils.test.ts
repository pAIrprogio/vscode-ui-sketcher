import { describe, expect, test } from "vitest";
import { isMermaid } from "./mermaid.utils";


describe("isMermaid", () => {
  test("should return true if code is mermaid", () => {
    expect(isMermaid("flowchart\n")).toBe(true)
    expect(isMermaid("flowchart LR\n")).toBe(true)

    const code = `
    flowchart TD
      A[Christmas] -->|Get money| B(Go shopping)
      B --> C{Let me think}
      C -->|One| D[Laptop]
      C -->|Two| E[iPhone]
      C -->|Three| F[fa:fa-car Car]
    `
    expect(isMermaid(code)).toBe(true)
  });
});
