export function never(x: never): never {
  throw new Error("Unexpected object: " + x);
}