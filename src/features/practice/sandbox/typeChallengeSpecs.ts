import type { TypeChallengeTest } from "@/lib/typeChecker/gradeTypeChallenge";

// Per-challenge type-level assertions for the standalone TypeScript Practice
// category — the real tests /api/practice/grade-type-challenge checks
// against via the actual TypeScript compiler (see gradeTypeChallenge.ts).
// This is the compile-time counterpart to testSpecs.ts's TEST_SPECS: the DB
// `test_cases` are display labels only, and each entry's `label` here
// matches the corresponding seeded `test_cases[].label` 1:1, same convention.
//
// Every `assertion` is a type expression that must resolve to `true`
// (typically `Equal<YourAnswer<...>, ExpectedShape>`) once appended after
// the student's own code as `type __testN = Expect<assertion>;`.

export const TYPE_CHALLENGE_SPECS: Record<string, TypeChallengeTest[]> = {
  // Stage 1 — Basic Mapped Types
  "implement-partial": [
    { label: "Makes every property optional", assertion: `Equal<MyPartial<{ title: string; done: boolean }>, { title?: string; done?: boolean }>` },
    { label: "Works for a single-property object too", assertion: `Equal<MyPartial<{ a: number }>, { a?: number }>` },
  ],
  "implement-required": [
    { label: "Strips the optional modifier from every property", assertion: `Equal<MyRequired<{ title?: string; done?: boolean }>, { title: string; done: boolean }>` },
    { label: "Leaves an already-required property unaffected", assertion: `Equal<MyRequired<{ a?: number; b: string }>, { a: number; b: string }>` },
  ],
  "implement-readonly": [
    { label: "Marks every property readonly", assertion: `Equal<MyReadonly<{ title: string }>, { readonly title: string }>` },
  ],
  "implement-pick": [
    { label: "Keeps only the single named property", assertion: `Equal<MyPick<{ title: string; description: string; completed: boolean }, "title">, { title: string }>` },
    { label: "Works with a union of keys, not just one", assertion: `Equal<MyPick<{ title: string; description: string; completed: boolean }, "title" | "completed">, { title: string; completed: boolean }>` },
  ],
  "implement-omit": [
    { label: "Drops the single named property", assertion: `Equal<MyOmit<{ title: string; description: string; completed: boolean }, "description">, { title: string; completed: boolean }>` },
    { label: "Works with a union of keys to drop", assertion: `Equal<MyOmit<{ title: string; description: string; completed: boolean }, "description" | "completed">, { title: string }>` },
  ],
  "implement-record": [
    { label: "Maps every key in the union to the same value type", assertion: `Equal<MyRecord<"a" | "b", number>, { a: number; b: number }>` },
  ],
  "implement-deep-partial": [
    { label: "Recurses into nested objects, not just the top level", assertion: `Equal<DeepPartial<{ a: { b: { c: string } } }>, { a?: { b?: { c?: string } } }>` },
    { label: "Still behaves like plain Partial for a flat (non-nested) object", assertion: `Equal<DeepPartial<{ a: string }>, { a?: string }>` },
  ],
  "implement-deep-readonly": [
    { label: "Recurses into nested objects, locking every level", assertion: `Equal<DeepReadonly<{ a: { b: string } }>, { readonly a: { readonly b: string } }>` },
    { label: "Still behaves like plain Readonly for a flat object", assertion: `Equal<DeepReadonly<{ a: string }>, { readonly a: string }>` },
  ],

  // Stage 2 — Union Filtering & Nullable Handling
  "implement-nonnullable": [
    { label: "Strips both null and undefined out of a union", assertion: `Equal<MyNonNullable<string | null | undefined>, string>` },
    { label: "Leaves a type with no null/undefined untouched", assertion: `Equal<MyNonNullable<number>, number>` },
  ],
  "implement-undefined-to-null": [
    { label: "Converts undefined to null within a union", assertion: `Equal<UndefinedToNull<string | undefined>, string | null>` },
    { label: "Leaves a type with no undefined untouched", assertion: `Equal<UndefinedToNull<string>, string>` },
  ],
  "implement-exclude": [
    { label: "Removes exactly the matching union member", assertion: `Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">` },
    { label: "Works against any type for E, not just literal unions", assertion: `Equal<MyExclude<string | number | boolean, boolean>, string | number>` },
  ],
  "implement-extract": [
    { label: "Keeps only the matching union members", assertion: `Equal<MyExtract<"a" | "b" | "c", "a" | "c">, "a" | "c">` },
    { label: "Works against any type for U, not just literal unions", assertion: `Equal<MyExtract<string | number | boolean, boolean>, boolean>` },
  ],

  // Stage 3 — Function & Class Introspection (infer)
  "implement-parameters": [
    { label: "Captures every parameter as a tuple, in order", assertion: `Equal<MyParameters<(a: string, b: number) => void>, [string, number]>` },
    { label: "Works for a function with no parameters", assertion: `Equal<MyParameters<() => void>, []>` },
  ],
  "implement-returntype": [
    { label: "Extracts a simple return type", assertion: `Equal<MyReturnType<() => string>, string>` },
    { label: "Ignores the parameters entirely, only captures the return position", assertion: `Equal<MyReturnType<(x: number) => boolean>, boolean>` },
  ],
  "implement-constructorparameters": [
    { label: "Captures the constructor's parameter types as a tuple", assertion: `Equal<MyConstructorParameters<new (title: string, done: boolean) => object>, [string, boolean]>` },
  ],
  "implement-instancetype": [
    { label: "Extracts the constructed instance's shape", assertion: `Equal<MyInstanceType<new () => { id: number }>, { id: number }>` },
  ],
  "implement-thisparametertype": [
    { label: "Extracts the declared this type", assertion: `Equal<MyThisParameterType<(this: { a: number }, x: string) => void>, { a: number }>` },
    { label: "Falls back to unknown when there's no explicit this parameter", assertion: `Equal<MyThisParameterType<(x: string) => void>, unknown>` },
  ],
  "implement-omitthisparameter": [
    { label: "Drops the this parameter, keeping the real parameters and return type", assertion: `Equal<MyOmitThisParameter<(this: { a: number }, x: string) => boolean>, (x: string) => boolean>` },
  ],
  "implement-unwrap-promise": [
    { label: "Unwraps a Promise's inner type", assertion: `Equal<UnwrapPromise<Promise<string>>, string>` },
    { label: "Passes through a non-Promise type unchanged", assertion: `Equal<UnwrapPromise<number>, number>` },
  ],
  "implement-awaited": [
    { label: "Recursively unwraps nested Promises, not just one level", assertion: `Equal<MyAwaited<Promise<Promise<string>>>, string>` },
    { label: "Still handles the single-level case correctly", assertion: `Equal<MyAwaited<Promise<number>>, number>` },
  ],

  // Stage 4 — String Literal Type Manipulation
  "implement-first-char": [
    { label: "Extracts the first character", assertion: `Equal<FirstChar<"hello">, "h">` },
    { label: "Returns an empty string for an empty input", assertion: `Equal<FirstChar<"">, "">` },
  ],
  "implement-last-char": [
    { label: "Recurses down to the final character", assertion: `Equal<LastChar<"hello">, "o">` },
    { label: "Handles a single-character string as its own base case", assertion: `Equal<LastChar<"a">, "a">` },
  ],
  "implement-length-of-string": [
    { label: "Counts every character correctly", assertion: `Equal<LengthOfString<"hello">, 5>` },
    { label: "Returns 0 for an empty string", assertion: `Equal<LengthOfString<"">, 0>` },
  ],
  "implement-trim": [
    { label: "Strips both leading and trailing spaces", assertion: `Equal<Trim<"  hello  ">, "hello">` },
    { label: "Leaves a string with no surrounding spaces unchanged", assertion: `Equal<Trim<"hello">, "hello">` },
  ],
  "implement-capitalize": [
    { label: "Uppercases the first character, leaves the rest alone", assertion: `Equal<MyCapitalize<"hello">, "Hello">` },
    { label: "Handles an empty string without error", assertion: `Equal<MyCapitalize<"">, "">` },
  ],
  "implement-split": [
    { label: "Splits on every occurrence of the delimiter", assertion: `Equal<Split<"a,b,c", ",">, ["a", "b", "c"]>` },
    { label: "Returns a single-element tuple when the delimiter never appears", assertion: `Equal<Split<"hello", ",">, ["hello"]>` },
  ],
  "implement-string-to-tuple": [
    { label: "Splits every character into its own tuple slot", assertion: `Equal<StringToTuple<"abc">, ["a", "b", "c"]>` },
    { label: "Returns an empty tuple for an empty string", assertion: `Equal<StringToTuple<"">, []>` },
  ],
  "implement-replace-all": [
    { label: "Replaces every occurrence, not just the first", assertion: `Equal<ReplaceAll<"foo-bar-foo", "foo", "baz">, "baz-bar-baz">` },
    { label: "Leaves the string unchanged when F never appears", assertion: `Equal<ReplaceAll<"abc", "x", "y">, "abc">` },
  ],
  "implement-join": [
    { label: "Joins every element with the delimiter between them", assertion: `Equal<Join<["a", "b", "c"], ",">, "a,b,c">` },
    { label: "A single-element tuple needs no delimiter at all", assertion: `Equal<Join<["hello"], ",">, "hello">` },
  ],
  "implement-prefix": [
    { label: "Prepends the prefix to a single string", assertion: `Equal<Prefix<"foo", "pre-">, "pre-foo">` },
    { label: "Distributes over a union automatically, prefixing every member", assertion: `Equal<Prefix<"a" | "b", "x">, "xa" | "xb">` },
  ],
  "implement-snake-case": [
    { label: "Inserts an underscore before each uppercase letter and lowercases it", assertion: `Equal<SnakeCase<"helloWorld">, "hello_world">` },
    { label: "Leaves an already-lowercase string unchanged", assertion: `Equal<SnakeCase<"foo">, "foo">` },
  ],
  "implement-camel-case": [
    { label: "Removes the underscore and uppercases the following letter", assertion: `Equal<CamelCase<"hello_world">, "helloWorld">` },
    { label: "Leaves a string with no underscores unchanged", assertion: `Equal<CamelCase<"foo">, "foo">` },
  ],

  // Stage 5 — Tuple & Array Manipulation
  "implement-first-item": [
    { label: "Extracts the first element", assertion: `Equal<FirstItem<[1, 2, 3]>, 1>` },
    { label: "Returns never for an empty tuple", assertion: `Equal<FirstItem<[]>, never>` },
  ],
  "implement-last-item": [
    { label: "Extracts the last element directly, no recursion needed", assertion: `Equal<LastItem<[1, 2, 3]>, 3>` },
    { label: "Returns never for an empty tuple", assertion: `Equal<LastItem<[]>, never>` },
  ],
  "implement-length-of-tuple": [
    { label: "Reads the tuple's length directly", assertion: `Equal<LengthOfTuple<[1, 2, 3]>, 3>` },
    { label: "Works for an empty tuple too", assertion: `Equal<LengthOfTuple<[]>, 0>` },
  ],
  "implement-tupletounion": [
    { label: "Collapses every element type into one union", assertion: `Equal<TupleToUnion<[1, 2, 3]>, 1 | 2 | 3>` },
  ],
  "implement-shift": [
    { label: "Drops exactly the first element, keeps the rest in order", assertion: `Equal<Shift<[1, 2, 3]>, [2, 3]>` },
    { label: "Handles an already-empty tuple without error", assertion: `Equal<Shift<[]>, []>` },
  ],
  "implement-push": [
    { label: "Appends the new element to the end", assertion: `Equal<Push<[1, 2], 3>, [1, 2, 3]>` },
    { label: "Works starting from an empty tuple", assertion: `Equal<Push<[], 1>, [1]>` },
  ],
  "implement-reverse-tuple": [
    { label: "Reverses the element order", assertion: `Equal<ReverseTuple<[1, 2, 3]>, [3, 2, 1]>` },
    { label: "Handles an empty tuple as its own base case", assertion: `Equal<ReverseTuple<[]>, []>` },
  ],
  "implement-slice": [
    { label: "Extracts the correct sub-range", assertion: `Equal<Slice<[1, 2, 3, 4, 5], 1, 3>, [2, 3]>` },
    { label: "A full-range slice returns everything", assertion: `Equal<Slice<[1, 2, 3], 0, 3>, [1, 2, 3]>` },
  ],
  "implement-flat": [
    { label: "Flattens nested arrays at any depth, not just one level", assertion: `Equal<Flat<[1, [2, [3, 4]], 5]>, [1, 2, 3, 4, 5]>` },
    { label: "Leaves an already-flat tuple unchanged", assertion: `Equal<Flat<[1, 2, 3]>, [1, 2, 3]>` },
  ],
  "implement-includes": [
    { label: "Finds a matching element", assertion: `Equal<Includes<[1, 2, 3], 2>, true>` },
    { label: "Returns false when nothing matches", assertion: `Equal<Includes<[1, 2, 3], 4>, false>` },
  ],
  "implement-filter": [
    { label: "Keeps only the elements matching the filter type, in order", assertion: `Equal<Filter<[1, "a", 2, "b"], number>, [1, 2]>` },
    { label: "Returns an empty tuple when nothing matches", assertion: `Equal<Filter<[1, 2, 3], string>, []>` },
  ],
  "implement-repeat": [
    { label: "Builds a tuple of the requested length, repeating the value", assertion: `Equal<Repeat<"x", 3>, ["x", "x", "x"]>` },
    { label: "Returns an empty tuple when the count is 0", assertion: `Equal<Repeat<0, 0>, []>` },
  ],
  "implement-repeat-string": [
    { label: "Concatenates the string onto itself the requested number of times", assertion: `Equal<RepeatString<"ab", 3>, "ababab">` },
    { label: "Returns an empty string when the count is 0", assertion: `Equal<RepeatString<"x", 0>, "">` },
  ],
  "implement-tuple-to-string": [
    { label: "Concatenates every element in order", assertion: `Equal<TupleToString<["a", "b", "c"]>, "abc">` },
    { label: "Returns an empty string for an empty tuple", assertion: `Equal<TupleToString<[]>, "">` },
  ],

  // Stage 6 — Type-Level Logic & Guards
  "implement-isnever": [
    { label: "Correctly identifies never itself", assertion: `Equal<IsNever<never>, true>` },
    { label: "Returns false for any other type", assertion: `Equal<IsNever<string>, false>` },
  ],
  "implement-isany": [
    { label: "Correctly identifies any itself", assertion: `Equal<IsAny<any>, true>` },
    { label: "Returns false for a normal, specific type", assertion: `Equal<IsAny<string>, false>` },
  ],
  "implement-isemptytype": [
    { label: "Identifies an empty object type", assertion: `Equal<IsEmptyType<{}>, true>` },
    { label: "Returns false once there's at least one key", assertion: `Equal<IsEmptyType<{ a: string }>, false>` },
  ],
  "implement-equal-type": [
    { label: "Identical literal types are equal", assertion: `Equal<MyEqual<1, 1>, true>` },
    { label: "Different literal types are not equal", assertion: `Equal<MyEqual<1, 2>, false>` },
    { label: "Structurally identical object types are equal", assertion: `Equal<MyEqual<{ a: string }, { a: string }>, true>` },
  ],
  "implement-assert-never": [
    { label: "Matches the exact required signature — a never parameter and a never return type", assertion: `Equal<typeof assertNever, (value: never) => never>` },
  ],

  // Stage 7 — Type-Level Arithmetic
  "implement-tonumber": [
    { label: "Converts a numeric string to the matching numeric literal", assertion: `Equal<ToNumber<"5">, 5>` },
    { label: "Handles zero as its own immediate base case", assertion: `Equal<ToNumber<"0">, 0>` },
  ],
  "implement-string-to-number": [
    { label: "Converts a multi-digit numeric string correctly", assertion: `Equal<StringToNumber<"12">, 12>` },
    { label: "Handles zero as its own immediate base case", assertion: `Equal<StringToNumber<"0">, 0>` },
  ],
  "implement-abs": [
    { label: "Strips the negative sign and converts back to a number", assertion: `Equal<Abs<-5>, 5>` },
    { label: "Leaves an already-positive number unchanged", assertion: `Equal<Abs<5>, 5>` },
  ],
  "implement-largerthan": [
    { label: "Correctly identifies A > B", assertion: `Equal<LargerThan<5, 3>, true>` },
    { label: "Correctly identifies A < B", assertion: `Equal<LargerThan<3, 5>, false>` },
    { label: "Equal numbers are not 'larger than' each other", assertion: `Equal<LargerThan<3, 3>, false>` },
  ],
  "implement-smallerthan": [
    { label: "Correctly identifies A < B", assertion: `Equal<SmallerThan<3, 5>, true>` },
    { label: "Correctly identifies A > B", assertion: `Equal<SmallerThan<5, 3>, false>` },
    { label: "Equal numbers are not 'smaller than' each other", assertion: `Equal<SmallerThan<3, 3>, false>` },
  ],
  "implement-add": [
    { label: "Adds two positive numbers correctly", assertion: `Equal<Add<3, 4>, 7>` },
    { label: "Adding zero returns the other operand unchanged", assertion: `Equal<Add<0, 5>, 5>` },
  ],
  "implement-subtract": [
    { label: "Subtracts correctly", assertion: `Equal<Subtract<7, 3>, 4>` },
    { label: "Subtracting a number from itself gives zero", assertion: `Equal<Subtract<5, 5>, 0>` },
  ],
  "implement-multiply": [
    { label: "Multiplies two positive numbers correctly", assertion: `Equal<Multiply<3, 4>, 12>` },
    { label: "Multiplying by zero gives zero", assertion: `Equal<Multiply<0, 5>, 0>` },
  ],
  "implement-divide": [
    { label: "Divides evenly", assertion: `Equal<Divide<12, 4>, 3>` },
    { label: "Works for a different pair of numbers, not hardcoded", assertion: `Equal<Divide<10, 2>, 5>` },
  ],

  // Stage 8 — Advanced Recursive & "Trick" Types (Capstone)
  "implement-find-index": [
    { label: "Finds the correct index of a matching element", assertion: `Equal<FindIndex<[1, 2, 3], 2>, 1>` },
    { label: "Returns -1 when nothing matches", assertion: `Equal<FindIndex<[1, 2, 3], 5>, -1>` },
  ],
  "implement-diff": [
    { label: "Keeps only the keys unique to one side, dropping the shared key", assertion: `Equal<Diff<{ a: string; b: number }, { b: number; c: boolean }>, { a: string; c: boolean }>` },
  ],
  "implement-object-paths": [
    { label: "Includes both top-level keys and dotted nested paths", assertion: `Equal<ObjectPaths<{ a: string; b: { c: number } }>, "a" | "b" | "b.c">` },
  ],
  "implement-map-string-union-to-object-union": [
    { label: "Produces one object per union member, not a single object with a unioned type field", assertion: `Equal<MapStringUnionToObjectUnion<"circle" | "square">, { type: "circle" } | { type: "square" }>` },
  ],
  "implement-extract-route-params": [
    { label: "Extracts every :param segment, however many there are", assertion: `Equal<ExtractRouteParams<"/users/:id/posts/:postId">, { id: string; postId: string }>` },
    { label: "A route with no params produces an empty object", assertion: `Equal<ExtractRouteParams<"/about">, {}>` },
  ],
  "implement-union-to-intersection": [
    { label: "Converts an object-type union into the intersection of its members", assertion: `Equal<UnionToIntersection<{ a: string } | { b: number }>, { a: string } & { b: number }>` },
    { label: "Works for primitive unions too, even ones with no realistic intersection", assertion: `Equal<UnionToIntersection<string | number>, string & number>` },
  ],
  "implement-sort": [
    { label: "Sorts an unordered tuple into ascending order", assertion: `Equal<Sort<[3, 1, 2]>, [1, 2, 3]>` },
    { label: "Handles an empty tuple as its own base case", assertion: `Equal<Sort<[]>, []>` },
  ],
  "implement-unique": [
    { label: "Removes duplicates, keeping the first occurrence of each value", assertion: `Equal<Unique<[1, 1, 2, 3, 3, 3]>, [1, 2, 3]>` },
    { label: "Handles an empty tuple as its own base case", assertion: `Equal<Unique<[]>, []>` },
  ],
};

export function getTypeChallengeSpec(slug: string): TypeChallengeTest[] | null {
  return TYPE_CHALLENGE_SPECS[slug] ?? null;
}
