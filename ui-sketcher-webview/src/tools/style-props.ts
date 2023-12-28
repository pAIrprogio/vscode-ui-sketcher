import { StyleProp } from "@tldraw/tldraw";

const validateString = (text: unknown): string => {
  if (typeof text !== "string") {
    throw new Error("Expected string");
  }
  return text;
};

export const SourceStyleProp = StyleProp.define("tldraw:TextStyle", {
  defaultValue: "",
  type: { validate: validateString },
});
