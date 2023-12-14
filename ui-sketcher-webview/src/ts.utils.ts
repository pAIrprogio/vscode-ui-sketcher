export function never(x: never): never {
  throw new Error("Unexpected object: " + x);
}

export type DeepReadOnly<T> = {
  readonly [P in keyof T]: T[P] extends (infer R)[]
    ? DeepReadOnlyArray<R>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T[P] extends Function
    ? T[P]
    : T[P] extends object
    ? DeepReadOnly<T[P]>
    : T[P];
};

interface DeepReadOnlyArray<T> extends ReadonlyArray<DeepReadOnly<T>> {}
