import type { ChallengeSeed } from "../types";

export const TYPESCRIPT_CHALLENGES: ChallengeSeed[] = [

  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 1 ────
  {
    slug: "implement-partial",
    companies: ["Microsoft", "Airbnb", "Stripe"],
    category: "typescript",
    title: "Implement Partial<T>",
    description: `The utility type every TS codebase reaches for daily: makes every property of \`T\` optional, so a partial update object only needs to include the fields it's actually changing.

## Your task

Write \`MyPartial<T>\`, a mapped type over \`keyof T\` that makes every property optional.

\`\`\`ts
type Result = MyPartial<{ title: string; done: boolean }>
// { title?: string; done?: boolean }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyPartial<T> = unknown;`,
    solutionCode: `type MyPartial<T> = { [P in keyof T]?: T[P] };`,
    testCases: [
      { input: "MyPartial<{ title: string; done: boolean }>", expected: "{ title?: string; done?: boolean }", label: "Makes every property optional" },
      { input: "MyPartial<{ a: number }>", expected: "{ a?: number }", label: "Works for a single-property object too" },
    ],
    hints: [
      "A mapped type's `?` modifier applied inside `{ [P in keyof T]?: T[P] }` is the entire implementation — no conditional types needed here.",
    ],
    orderIndex: 1265,
  },

  {
    slug: "implement-required",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement Required<T>",
    description: `The inverse of \`Partial\`: strips the \`?\` modifier from every property, so a type that started with optional fields becomes fully required.

## Your task

Write \`MyRequired<T>\`, making every property of \`T\` required, even ones that were originally optional.

\`\`\`ts
type Result = MyRequired<{ title?: string; done?: boolean }>
// { title: string; done: boolean }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyRequired<T> = unknown;`,
    solutionCode: `type MyRequired<T> = { [P in keyof T]-?: T[P] };`,
    testCases: [
      { input: "MyRequired<{ title?: string; done?: boolean }>", expected: "{ title: string; done: boolean }", label: "Strips the optional modifier from every property" },
      { input: "MyRequired<{ a?: number; b: string }>", expected: "{ a: number; b: string }", label: "Leaves an already-required property unaffected" },
    ],
    hints: [
      "The `-?` modifier removes `?` the same way a plain `?` adds it — mapped-type modifiers can be subtracted, not just applied.",
    ],
    orderIndex: 1266,
  },

  {
    slug: "implement-readonly",
    companies: ["Microsoft", "Stripe"],
    category: "typescript",
    title: "Implement Readonly<T>",
    description: `Marks every property of \`T\` as \`readonly\`, so the compiler rejects any attempt to reassign them after the object is created.

## Your task

Write \`MyReadonly<T>\`, making every property of \`T\` readonly.

\`\`\`ts
type Result = MyReadonly<{ title: string }>
// { readonly title: string }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyReadonly<T> = unknown;`,
    solutionCode: `type MyReadonly<T> = { readonly [P in keyof T]: T[P] };`,
    testCases: [
      { input: "MyReadonly<{ title: string }>", expected: "{ readonly title: string }", label: "Marks every property readonly" },
    ],
    hints: [
      "readonly is a mapped-type modifier just like `?` — it goes right before the `[P in keyof T]` clause.",
    ],
    orderIndex: 1267,
  },

  {
    slug: "implement-pick",
    companies: ["Microsoft", "Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement Pick<T, K>",
    description: `One of the most-used utility types in real code: builds a new type containing only the properties named in \`K\`.

## Your task

Write \`MyPick<T, K extends keyof T>\`, keeping only the properties of \`T\` whose keys are in \`K\`.

\`\`\`ts
type Result = MyPick<{ title: string; description: string; completed: boolean }, "title">
// { title: string }

type Result2 = MyPick<{ title: string; description: string; completed: boolean }, "title" | "completed">
// { title: string; completed: boolean }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyPick<T, K extends keyof T> = unknown;`,
    solutionCode: `type MyPick<T, K extends keyof T> = { [P in K]: T[P] };`,
    testCases: [
      { input: "MyPick<{ title: string; description: string; completed: boolean }, 'title'>", expected: "{ title: string }", label: "Keeps only the single named property" },
      { input: "MyPick<{ title: string; description: string; completed: boolean }, 'title' | 'completed'>", expected: "{ title: string; completed: boolean }", label: "Works with a union of keys, not just one" },
    ],
    hints: [
      "K extends keyof T as a constraint is what lets you map directly over K instead of keyof T — that's the whole difference from Partial's mapped type.",
    ],
    orderIndex: 1268,
  },

  {
    slug: "implement-omit",
    companies: ["Microsoft", "Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement Omit<T, K>",
    description: `The inverse of \`Pick\`: builds a new type with every property of \`T\` *except* the ones named in \`K\`.

## Your task

Write \`MyOmit<T, K extends keyof T>\`, dropping the properties of \`T\` whose keys are in \`K\`.

\`\`\`ts
type Result = MyOmit<{ title: string; description: string; completed: boolean }, "description">
// { title: string; completed: boolean }

type Result2 = MyOmit<{ title: string; description: string; completed: boolean }, "description" | "completed">
// { title: string }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyOmit<T, K extends keyof T> = unknown;`,
    solutionCode: `type MyOmit<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };`,
    testCases: [
      { input: "MyOmit<{ title: string; description: string; completed: boolean }, 'description'>", expected: "{ title: string; completed: boolean }", label: "Drops the single named property" },
      { input: "MyOmit<{ title: string; description: string; completed: boolean }, 'description' | 'completed'>", expected: "{ title: string }", label: "Works with a union of keys to drop" },
    ],
    hints: [
      "A key-remapping `as` clause that maps a dropped key to `never` is what removes it from the resulting mapped type entirely — `never` as a computed key vanishes rather than becoming a literal property.",
    ],
    orderIndex: 1269,
  },

  {
    slug: "implement-record",
    companies: ["Microsoft", "Amazon"],
    category: "typescript",
    title: "Implement Record<K, V>",
    description: `Builds an object type with a fixed set of keys \`K\`, all mapped to the same value type \`V\` — the type-level equivalent of "a dictionary from K to V."

## Your task

Write \`MyRecord<K extends keyof any, V>\`, an object type whose keys are exactly \`K\`, each with value type \`V\`.

\`\`\`ts
type Result = MyRecord<"a" | "b", number>
// { a: number; b: number }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyRecord<K extends keyof any, V> = unknown;`,
    solutionCode: `type MyRecord<K extends keyof any, V> = { [P in K]: V };`,
    testCases: [
      { input: "MyRecord<'a' | 'b', number>", expected: "{ a: number; b: number }", label: "Maps every key in the union to the same value type" },
    ],
    hints: [
      "`keyof any` (the constraint on K) resolves to `string | number | symbol` — the universe of everything that can legally be an object key.",
    ],
    orderIndex: 1270,
  },

  {
    slug: "implement-deep-partial",
    companies: ["Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement DeepPartial<T> (Recursive Partial)",
    description: `The most common senior-level follow-up to \`Partial\`: a shallow \`Partial\` only makes the *top-level* properties optional — nested objects still require every one of their own fields. \`DeepPartial\` recurses into every nested object too.

## Your task

Write \`DeepPartial<T>\`, recursively making every property — at every nesting depth — optional.

\`\`\`ts
type Result = DeepPartial<{ a: { b: { c: string } } }>
// { a?: { b?: { c?: string } } }

type Result2 = DeepPartial<{ a: string }>
// { a?: string } — still behaves like plain Partial when there's no nesting
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type DeepPartial<T> = unknown;`,
    solutionCode: `type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;`,
    testCases: [
      { input: "DeepPartial<{ a: { b: { c: string } } }>", expected: "{ a?: { b?: { c?: string } } }", label: "Recurses into nested objects, not just the top level" },
      { input: "DeepPartial<{ a: string }>", expected: "{ a?: string }", label: "Still behaves like plain Partial for a flat (non-nested) object" },
    ],
    hints: [
      "The base case matters as much as the recursive step: a non-object type (T extends object ? ... : T) has to be returned as-is, or you'll try to recurse into primitives like string and number forever.",
    ],
    orderIndex: 1271,
  },

  {
    slug: "implement-deep-readonly",
    companies: ["Stripe", "Airbnb"],
    category: "typescript",
    title: "Implement DeepReadonly<T> (Recursive Readonly)",
    description: `The recursive version of \`Readonly\` — reported constantly in senior-level 2026 prep guides. A shallow \`Readonly\` only locks the top-level properties; nested objects are still fully mutable. \`DeepReadonly\` locks every level.

## Your task

Write \`DeepReadonly<T>\`, recursively marking every property — at every nesting depth — readonly.

\`\`\`ts
type Result = DeepReadonly<{ a: { b: string } }>
// { readonly a: { readonly b: string } }

type Result2 = DeepReadonly<{ a: string }>
// { readonly a: string } — still behaves like plain Readonly when there's no nesting
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type DeepReadonly<T> = unknown;`,
    solutionCode: `type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;`,
    testCases: [
      { input: "DeepReadonly<{ a: { b: string } }>", expected: "{ readonly a: { readonly b: string } }", label: "Recurses into nested objects, locking every level" },
      { input: "DeepReadonly<{ a: string }>", expected: "{ readonly a: string }", label: "Still behaves like plain Readonly for a flat object" },
    ],
    hints: [
      "Same recursive shape as DeepPartial — the only difference is which mapped-type modifier you apply at each level.",
    ],
    orderIndex: 1272,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 2 ────
  {
    slug: "implement-nonnullable",
    companies: ["Microsoft", "Amazon"],
    category: "typescript",
    title: "Implement NonNullable<T>",
    description: `Strips \`null\` and \`undefined\` out of a type — your first taste of a conditional type applied to a union, since a conditional type applied directly to a union member distributes over each member automatically.

## Your task

Write \`MyNonNullable<T>\`, removing \`null\` and \`undefined\` from \`T\`.

\`\`\`ts
type Result = MyNonNullable<string | null | undefined>
// string

type Result2 = MyNonNullable<number>
// number — a type with no null/undefined passes through unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyNonNullable<T> = unknown;`,
    solutionCode: `type MyNonNullable<T> = T extends null | undefined ? never : T;`,
    testCases: [
      { input: "MyNonNullable<string | null | undefined>", expected: "string", label: "Strips both null and undefined out of a union" },
      { input: "MyNonNullable<number>", expected: "number", label: "Leaves a type with no null/undefined untouched" },
    ],
    hints: [
      "Because T is a naked type parameter here, `T extends null | undefined ? never : T` distributes automatically over a union — you get this behavior for free, without writing any recursion.",
    ],
    orderIndex: 1273,
  },

  {
    slug: "implement-undefined-to-null",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement UndefinedToNull<T>",
    description: `A narrower cousin of \`NonNullable\`: instead of removing \`undefined\`, it *converts* it to \`null\` — useful when normalizing API response shapes where a backend team standardized on \`null\` for "absent" instead of \`undefined\`.

## Your task

Write \`UndefinedToNull<T>\`, replacing \`undefined\` with \`null\` anywhere it appears in \`T\` (leaving everything else unchanged).

\`\`\`ts
type Result = UndefinedToNull<string | undefined>
// string | null

type Result2 = UndefinedToNull<string>
// string — a type with no undefined passes through unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type UndefinedToNull<T> = unknown;`,
    solutionCode: `type UndefinedToNull<T> = T extends undefined ? null : T;`,
    testCases: [
      { input: "UndefinedToNull<string | undefined>", expected: "string | null", label: "Converts undefined to null within a union" },
      { input: "UndefinedToNull<string>", expected: "string", label: "Leaves a type with no undefined untouched" },
    ],
    hints: [
      "Same distributive-conditional shape as NonNullable — only the branch's replacement value differs.",
    ],
    orderIndex: 1274,
  },

  {
    slug: "implement-exclude",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement Exclude<T, E>",
    description: `The generalized version of what \`NonNullable\` does for a fixed \`null | undefined\` — removes every member of union \`T\` that's assignable to \`E\`, for any \`E\` you choose.

## Your task

Write \`MyExclude<T, E>\`, removing every member of \`T\` that's assignable to \`E\`.

\`\`\`ts
type Result = MyExclude<"a" | "b" | "c", "a">
// "b" | "c"

type Result2 = MyExclude<string | number | boolean, boolean>
// string | number — E can be any type, not just a literal union member
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyExclude<T, E> = unknown;`,
    solutionCode: `type MyExclude<T, E> = T extends E ? never : T;`,
    testCases: [
      { input: "MyExclude<'a' | 'b' | 'c', 'a'>", expected: "'b' | 'c'", label: "Removes exactly the matching union member" },
      { input: "MyExclude<string | number | boolean, boolean>", expected: "string | number", label: "Works against any type for E, not just literal unions" },
    ],
    hints: [
      "This is the exact same shape as NonNullable, generalized — NonNullable is really just Exclude<T, null | undefined> under the hood.",
    ],
    orderIndex: 1275,
  },

  {
    slug: "implement-extract",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement Extract<T, U>",
    description: `The mirror image of \`Exclude\`: instead of removing matching members, it keeps *only* the members of \`T\` that are assignable to \`U\`.

## Your task

Write \`MyExtract<T, U>\`, keeping only the members of \`T\` that are assignable to \`U\`.

\`\`\`ts
type Result = MyExtract<"a" | "b" | "c", "a" | "c">
// "a" | "c"

type Result2 = MyExtract<string | number | boolean, boolean>
// boolean — U can be any type, not just a literal union member
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyExtract<T, U> = unknown;`,
    solutionCode: `type MyExtract<T, U> = T extends U ? T : never;`,
    testCases: [
      { input: "MyExtract<'a' | 'b' | 'c', 'a' | 'c'>", expected: "'a' | 'c'", label: "Keeps only the matching union members" },
      { input: "MyExtract<string | number | boolean, boolean>", expected: "boolean", label: "Works against any type for U, not just literal unions" },
    ],
    hints: [
      "Flip Exclude's two branches and you have Extract — everything else about the shape is identical.",
    ],
    orderIndex: 1276,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 3 ────
  {
    slug: "implement-parameters",
    companies: ["Microsoft", "Airbnb", "Slack"],
    category: "typescript",
    title: "Implement Parameters<T>",
    description: `Where \`infer\` earns its keep: pulling a piece of type information back out of a function signature — here, its parameter types, captured as a tuple.

## Your task

Write \`MyParameters<T extends (...args: any) => any>\`, extracting \`T\`'s parameter types as a tuple.

\`\`\`ts
type Result = MyParameters<(a: string, b: number) => void>
// [string, number]

type Result2 = MyParameters<() => void>
// [] — a function with no parameters produces an empty tuple
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyParameters<T extends (...args: any) => any> = unknown;`,
    solutionCode: `type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;`,
    testCases: [
      { input: "MyParameters<(a: string, b: number) => void>", expected: "[string, number]", label: "Captures every parameter as a tuple, in order" },
      { input: "MyParameters<() => void>", expected: "[]", label: "Works for a function with no parameters" },
    ],
    hints: [
      "infer P inside the parameter position of a function type captures the whole parameter list as a tuple — you don't need to destructure it argument by argument.",
    ],
    orderIndex: 1277,
  },

  {
    slug: "implement-returntype",
    companies: ["Microsoft", "Airbnb", "Discord"],
    category: "typescript",
    title: "Implement ReturnType<T>",
    description: `The most commonly asked \`infer\`-based utility type to implement from scratch: pulls a function's return type back out of its signature.

## Your task

Write \`MyReturnType<T extends (...args: any) => any>\`, extracting \`T\`'s return type.

\`\`\`ts
type Result = MyReturnType<() => string>
// string
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyReturnType<T extends (...args: any) => any> = unknown;`,
    solutionCode: `type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;`,
    testCases: [
      { input: "MyReturnType<() => string>", expected: "string", label: "Extracts a simple return type" },
      { input: "MyReturnType<(x: number) => boolean>", expected: "boolean", label: "Ignores the parameters entirely, only captures the return position" },
    ],
    hints: [
      "infer R in the return-type position mirrors Parameters' infer P in the parameter position — same technique, different slot of the function signature.",
    ],
    orderIndex: 1278,
  },

  {
    slug: "implement-constructorparameters",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement ConstructorParameters<T>",
    description: `The class-constructor counterpart to \`Parameters\` — extracts a class's constructor argument types, using \`new (...args) => any\` instead of a plain function signature.

## Your task

Write \`MyConstructorParameters<T extends abstract new (...args: any) => any>\`, extracting the constructor's parameter types as a tuple.

\`\`\`ts
type Result = MyConstructorParameters<new (title: string, done: boolean) => object>
// [string, boolean]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyConstructorParameters<T extends abstract new (...args: any) => any> = unknown;`,
    solutionCode: `type MyConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;`,
    testCases: [
      { input: "MyConstructorParameters<new (title: string, done: boolean) => object>", expected: "[string, boolean]", label: "Captures the constructor's parameter types as a tuple" },
    ],
    hints: [
      "abstract new (...) => any is the type-level shape of 'a class constructor,' the same way (...) => any is the shape of 'a function' — infer works the same way in either slot.",
    ],
    orderIndex: 1279,
  },

  {
    slug: "implement-instancetype",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement InstanceType<T>",
    description: `Pulls the *instance* type back out of a class constructor's type — the type you'd get from actually calling \`new\` on it.

## Your task

Write \`MyInstanceType<T extends abstract new (...args: any) => any>\`, extracting the type of an instance constructed by \`T\`.

\`\`\`ts
type Result = MyInstanceType<new () => { id: number }>
// { id: number }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyInstanceType<T extends abstract new (...args: any) => any> = unknown;`,
    solutionCode: `type MyInstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : never;`,
    testCases: [
      { input: "MyInstanceType<new () => { id: number }>", expected: "{ id: number }", label: "Extracts the constructed instance's shape" },
    ],
    hints: [
      "Same structure as ConstructorParameters, just inferring the return position (the constructed instance) instead of the parameter position.",
    ],
    orderIndex: 1280,
  },

  {
    slug: "implement-thisparametertype",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement ThisParameterType<T>",
    description: `A rarer one, but it shows up: extracts a function's explicit \`this\` parameter type — the special, call-time-only parameter TypeScript lets you declare as the very first parameter of a function signature.

## Your task

Write \`MyThisParameterType<T>\`, extracting the \`this\` type from \`T\`'s signature (or \`unknown\` if it has none).

\`\`\`ts
type Result = MyThisParameterType<(this: { a: number }, x: string) => void>
// { a: number }

type Result2 = MyThisParameterType<(x: string) => void>
// unknown — falls back to unknown when there's no explicit this parameter
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyThisParameterType<T> = unknown;`,
    solutionCode: `type MyThisParameterType<T> = T extends (this: infer U, ...args: any) => any ? U : unknown;`,
    testCases: [
      { input: "MyThisParameterType<(this: { a: number }, x: string) => void>", expected: "{ a: number }", label: "Extracts the declared this type" },
      { input: "MyThisParameterType<(x: string) => void>", expected: "unknown", label: "Falls back to unknown when there's no explicit this parameter" },
    ],
    hints: [
      "this in a function type's parameter list is purely a type-level annotation — infer can capture it exactly like any other parameter position.",
    ],
    orderIndex: 1281,
  },

  {
    slug: "implement-omitthisparameter",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement OmitThisParameter<T>",
    description: `The inverse of \`ThisParameterType\`: strips the \`this\` parameter back out of a function signature, leaving a callable type with the same real parameters and return type but no \`this\` requirement.

## Your task

Write \`MyOmitThisParameter<T>\`, removing \`T\`'s \`this\` parameter (if it has one).

\`\`\`ts
type Result = MyOmitThisParameter<(this: { a: number }, x: string) => boolean>
// (x: string) => boolean
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyOmitThisParameter<T> = unknown;`,
    solutionCode: `type MyOmitThisParameter<T> = T extends (this: any, ...args: infer A) => infer R ? (...args: A) => R : T;`,
    testCases: [
      { input: "MyOmitThisParameter<(this: { a: number }, x: string) => boolean>", expected: "(x: string) => boolean", label: "Drops the this parameter, keeping the real parameters and return type" },
    ],
    hints: [
      "Capture the real parameters and the return type with their own infer slots, then rebuild the function type from just those two pieces — the this parameter simply never gets copied over.",
    ],
    orderIndex: 1282,
  },

  {
    slug: "implement-unwrap-promise",
    companies: ["Stripe", "Airbnb", "Netflix"],
    category: "typescript",
    title: "Implement UnwrapPromise<T>",
    description: `A very common real-world \`infer\` use: pulling the resolved value type back out of a \`Promise\`, needed constantly in async-heavy codebases for typing what an \`await\`-ed value actually is.

## Your task

Write \`UnwrapPromise<T>\`, extracting \`Promise\`'s inner type — or returning \`T\` unchanged if it isn't a \`Promise\` at all.

\`\`\`ts
type Result = UnwrapPromise<Promise<string>>
// string

type Result2 = UnwrapPromise<number>
// number — a non-Promise type passes through unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type UnwrapPromise<T> = unknown;`,
    solutionCode: `type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;`,
    testCases: [
      { input: "UnwrapPromise<Promise<string>>", expected: "string", label: "Unwraps a Promise's inner type" },
      { input: "UnwrapPromise<number>", expected: "number", label: "Passes through a non-Promise type unchanged" },
    ],
    hints: [
      "This one only unwraps a single level — a Promise<Promise<string>> stays partly wrapped, which is exactly the gap the next question (Awaited) fixes.",
    ],
    orderIndex: 1283,
  },

  {
    slug: "implement-awaited",
    companies: ["Stripe", "Vercel"],
    category: "typescript",
    title: "Implement Awaited<T> (Recursive UnwrapPromise)",
    description: `The built-in, recursive version of \`UnwrapPromise\` — a common senior follow-up. A single-level unwrap leaves a \`Promise<Promise<string>>\` still partially wrapped; \`Awaited\` keeps unwrapping until it hits a non-Promise type.

## Your task

Write \`MyAwaited<T>\`, recursively unwrapping nested Promises down to the final resolved value.

\`\`\`ts
type Result = MyAwaited<Promise<Promise<string>>>
// string
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MyAwaited<T> = unknown;`,
    solutionCode: `type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;`,
    testCases: [
      { input: "MyAwaited<Promise<Promise<string>>>", expected: "string", label: "Recursively unwraps nested Promises, not just one level" },
      { input: "MyAwaited<Promise<number>>", expected: "number", label: "Still handles the single-level case correctly" },
    ],
    hints: [
      "The only change from UnwrapPromise is recursing into MyAwaited<U> instead of returning U directly — the base case (T isn't a Promise) is identical.",
    ],
    orderIndex: 1284,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 4 ────
  {
    slug: "implement-first-char",
    companies: [],
    category: "typescript",
    title: "Implement FirstChar<T>",
    description: `Template literal types let you pattern-match on the structure of a string type itself — here, splitting off just its first character via \`infer\`.

## Your task

Write \`FirstChar<T extends string>\`, extracting the first character of \`T\` (or \`""\` if \`T\` is empty).

\`\`\`ts
type Result = FirstChar<"hello">
// "h"

type Result2 = FirstChar<"">
// "" — an empty string has no first character
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type FirstChar<T extends string> = unknown;`,
    solutionCode: `type FirstChar<T extends string> = T extends \`\${infer F}\${string}\` ? F : "";`,
    testCases: [
      { input: "FirstChar<'hello'>", expected: "'h'", label: "Extracts the first character" },
      { input: "FirstChar<''>", expected: "''", label: "Returns an empty string for an empty input" },
    ],
    hints: [
      "A template literal pattern like `${infer F}${string}` matches 'one captured character, then anything' — infer works on string structure the same way it works on function signatures.",
    ],
    orderIndex: 1285,
  },

  {
    slug: "implement-last-char",
    companies: [],
    category: "typescript",
    title: "Implement LastChar<T>",
    description: `The trickier sibling of \`FirstChar\`: since template literal patterns naturally split off the *front* of a string, getting the *last* character means recursing until only one character is left.

## Your task

Write \`LastChar<T extends string>\`, extracting the last character of \`T\`.

\`\`\`ts
type Result = LastChar<"hello">
// "o"

type Result2 = LastChar<"a">
// "a" — a single-character string is its own last character
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type LastChar<T extends string> = unknown;`,
    solutionCode: `type LastChar<T extends string> = T extends \`\${infer First}\${infer Rest}\`
  ? Rest extends "" ? First : LastChar<Rest>
  : "";`,
    testCases: [
      { input: "LastChar<'hello'>", expected: "'o'", label: "Recurses down to the final character" },
      { input: "LastChar<'a'>", expected: "'a'", label: "Handles a single-character string as its own base case" },
    ],
    hints: [
      "Peel off one character at a time (infer First, infer Rest) and recurse on Rest — the moment Rest is empty, First is whatever's left, which is the last character.",
    ],
    orderIndex: 1286,
  },

  {
    slug: "implement-length-of-string",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement LengthOfString<S>",
    description: `Counting a string type's characters at the type level — since there's no direct "length" operation on a string type, you build up a tuple one character at a time and read *its* length instead.

## Your task

Write \`LengthOfString<S extends string>\`, returning \`S\`'s character count as a numeric literal type.

\`\`\`ts
type Result = LengthOfString<"hello">
// 5

type Result2 = LengthOfString<"">
// 0
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type LengthOfString<S extends string> = unknown;`,
    solutionCode: `type LengthOfString<S extends string, Acc extends unknown[] = []> =
  S extends \`\${string}\${infer Rest}\` ? LengthOfString<Rest, [...Acc, unknown]> : Acc["length"];`,
    testCases: [
      { input: "LengthOfString<'hello'>", expected: "5", label: "Counts every character correctly" },
      { input: "LengthOfString<''>", expected: "0", label: "Returns 0 for an empty string" },
    ],
    hints: [
      "A tuple's `[\"length\"]` property is itself a numeric literal type — building a tuple with one element per character and reading its length is the standard trick for 'counting' at the type level.",
    ],
    orderIndex: 1287,
  },

  {
    slug: "implement-trim",
    companies: ["Amazon", "Shopify"],
    category: "typescript",
    title: "Implement Trim<S> (Leading/Trailing Spaces)",
    description: `Strips leading and trailing spaces from a string type — recursing from each end independently, then combining both directions.

## Your task

Write \`Trim<S extends string>\`, removing leading and trailing spaces from \`S\`.

\`\`\`ts
type Result = Trim<"  hello  ">
// "hello"

type Result2 = Trim<"hello">
// "hello" — a string with no surrounding spaces is left unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Trim<S extends string> = unknown;`,
    solutionCode: `type TrimLeft<S extends string> = S extends \` \${infer Rest}\` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends \`\${infer Rest} \` ? TrimRight<Rest> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;`,
    testCases: [
      { input: "Trim<'  hello  '>", expected: "'hello'", label: "Strips both leading and trailing spaces" },
      { input: "Trim<'hello'>", expected: "'hello'", label: "Leaves a string with no surrounding spaces unchanged" },
    ],
    hints: [
      "Solve the two ends independently (TrimLeft, TrimRight) and compose them — trying to handle both directions in one recursive type at once is much harder than it needs to be.",
    ],
    orderIndex: 1288,
  },

  {
    slug: "implement-capitalize",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement Capitalize<S> (from Scratch)",
    description: `A good warm-up for re-implementing a real TypeScript built-in: uppercase just the first character of a string type, leaving the rest untouched.

## Your task

Write \`MyCapitalize<S extends string>\`, uppercasing \`S\`'s first character.

\`\`\`ts
type Result = MyCapitalize<"hello">
// "Hello"

type Result2 = MyCapitalize<"">
// "" — an empty string has no character to uppercase
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type MyCapitalize<S extends string> = unknown;`,
    solutionCode: `type MyCapitalize<S extends string> = S extends \`\${infer F}\${infer Rest}\` ? \`\${Uppercase<F>}\${Rest}\` : S;`,
    testCases: [
      { input: "MyCapitalize<'hello'>", expected: "'Hello'", label: "Uppercases the first character, leaves the rest alone" },
      { input: "MyCapitalize<''>", expected: "''", label: "Handles an empty string without error" },
    ],
    hints: [
      "TypeScript's built-in Uppercase<T> intrinsic does the actual case conversion — your job is just isolating the first character to apply it to.",
    ],
    orderIndex: 1289,
  },

  {
    slug: "implement-split",
    companies: ["Amazon", "Shopify"],
    category: "typescript",
    title: "Implement Split<S, D>",
    description: `The type-level version of \`String.prototype.split\` — breaks a string type into a tuple of substrings wherever the delimiter \`D\` occurs.

## Your task

Write \`Split<S extends string, D extends string>\`, splitting \`S\` on every occurrence of \`D\` into a tuple.

\`\`\`ts
type Result = Split<"a,b,c", ",">
// ["a", "b", "c"]

type Result2 = Split<"hello", ",">
// ["hello"] — when the delimiter never appears, you get a single-element tuple
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Split<S extends string, D extends string> = unknown;`,
    solutionCode: `type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : [S];`,
    testCases: [
      { input: "Split<'a,b,c', ','>", expected: "['a', 'b', 'c']", label: "Splits on every occurrence of the delimiter" },
      { input: "Split<'hello', ','>", expected: "['hello']", label: "Returns a single-element tuple when the delimiter never appears" },
    ],
    hints: [
      "The base case (no more delimiter found) has to wrap the remaining string in a single-element tuple, [S] — not return S bare, or the result type won't be a consistent tuple shape across recursive calls.",
    ],
    orderIndex: 1290,
  },

  {
    slug: "implement-string-to-tuple",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement StringToTuple<T>",
    description: `The character-by-character special case of \`Split\` — turns a string type into a tuple of its individual characters, as if splitting on \`""\`.

## Your task

Write \`StringToTuple<S extends string>\`, turning \`S\` into a tuple of its individual characters.

\`\`\`ts
type Result = StringToTuple<"abc">
// ["a", "b", "c"]

type Result2 = StringToTuple<"">
// [] — an empty string produces an empty tuple
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type StringToTuple<S extends string> = unknown;`,
    solutionCode: `type StringToTuple<S extends string> = S extends \`\${infer F}\${infer Rest}\` ? [F, ...StringToTuple<Rest>] : [];`,
    testCases: [
      { input: "StringToTuple<'abc'>", expected: "['a', 'b', 'c']", label: "Splits every character into its own tuple slot" },
      { input: "StringToTuple<''>", expected: "[]", label: "Returns an empty tuple for an empty string" },
    ],
    hints: [
      "This is simpler than Split — there's no delimiter to search for, just peel off one character per recursive call.",
    ],
    orderIndex: 1291,
  },

  {
    slug: "implement-replace-all",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement ReplaceAll<S, F, T>",
    description: `The type-level version of \`String.prototype.replaceAll\` — every occurrence of \`F\` inside \`S\` gets replaced with \`T\`, not just the first one.

## Your task

Write \`ReplaceAll<S extends string, F extends string, T extends string>\`, replacing every occurrence of \`F\` in \`S\` with \`T\`.

\`\`\`ts
type Result = ReplaceAll<"foo-bar-foo", "foo", "baz">
// "baz-bar-baz"

type Result2 = ReplaceAll<"abc", "x", "y">
// "abc" — left unchanged when F never appears in S
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type ReplaceAll<S extends string, F extends string, T extends string> = unknown;`,
    solutionCode: `type ReplaceAll<S extends string, F extends string, T extends string> =
  F extends "" ? S :
  S extends \`\${infer Head}\${F}\${infer Tail}\`
    ? \`\${Head}\${T}\${ReplaceAll<Tail, F, T>}\`
    : S;`,
    testCases: [
      { input: "ReplaceAll<'foo-bar-foo', 'foo', 'baz'>", expected: "'baz-bar-baz'", label: "Replaces every occurrence, not just the first" },
      { input: "ReplaceAll<'abc', 'x', 'y'>", expected: "'abc'", label: "Leaves the string unchanged when F never appears" },
    ],
    hints: [
      "Guard against an empty F explicitly — matching against `${infer Head}${''}${infer Tail}` would otherwise match everywhere and recurse forever.",
    ],
    orderIndex: 1292,
  },

  {
    slug: "implement-join",
    companies: ["Amazon", "Shopify"],
    category: "typescript",
    title: "Implement Join<T, D> (the Inverse of Split)",
    description: `Where \`Split\` breaks a string into a tuple, \`Join\` puts one back together — combining a tuple of strings into a single string type, with \`D\` inserted between each piece.

## Your task

Write \`Join<T extends readonly string[], D extends string>\`, joining every element of \`T\` with \`D\` between them.

\`\`\`ts
type Result = Join<["a", "b", "c"], ",">
// "a,b,c"

type Result2 = Join<["hello"], ",">
// "hello" — a single-element tuple needs no delimiter at all
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Join<T extends readonly string[], D extends string> = unknown;`,
    solutionCode: `type Join<T extends readonly string[], D extends string> =
  T extends readonly [infer F extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? F : \`\${F}\${D}\${Join<Rest, D>}\`
    : "";`,
    testCases: [
      { input: "Join<['a', 'b', 'c'], ','>", expected: "'a,b,c'", label: "Joins every element with the delimiter between them" },
      { input: "Join<['hello'], ','>", expected: "'hello'", label: "A single-element tuple needs no delimiter at all" },
    ],
    hints: [
      "The base case (Rest is empty) must return F bare, with no trailing delimiter — that's what stops you from getting a dangling 'c,' at the end.",
    ],
    orderIndex: 1293,
  },

  {
    slug: "implement-prefix",
    companies: [],
    category: "typescript",
    title: "Implement Prefix<T, P>",
    description: `A small but genuinely useful pattern: prepend a fixed prefix to a string type — and since template literal types distribute over unions automatically, this works across a whole union of strings for free.

## Your task

Write \`Prefix<T extends string, P extends string>\`, prepending \`P\` to \`T\`.

\`\`\`ts
type Result = Prefix<"foo", "pre-">
// "pre-foo"

type Result2 = Prefix<"a" | "b", "x">
// "xa" | "xb" — distributes over a union automatically, prefixing every member
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type Prefix<T extends string, P extends string> = unknown;`,
    solutionCode: `type Prefix<T extends string, P extends string> = \`\${P}\${T}\`;`,
    testCases: [
      { input: "Prefix<'foo', 'pre-'>", expected: "'pre-foo'", label: "Prepends the prefix to a single string" },
      { input: "Prefix<'a' | 'b', 'x'>", expected: "'xa' | 'xb'", label: "Distributes over a union automatically, prefixing every member" },
    ],
    hints: [
      "No conditional type is needed for the union case — substituting a union type parameter directly into a template literal type distributes over it on its own.",
    ],
    orderIndex: 1294,
  },

  {
    slug: "implement-snake-case",
    companies: ["Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement SnakeCase<S>",
    description: `Converting \`camelCase\` to \`snake_case\` at the type level — real API response shape conversion. Every uppercase letter needs an underscore inserted before it (and itself lowercased); everything else passes through untouched.

## Your task

Write \`SnakeCase<S extends string>\`, converting \`camelCase\` to \`snake_case\`.

\`\`\`ts
type Result = SnakeCase<"helloWorld">
// "hello_world"

type Result2 = SnakeCase<"foo">
// "foo" — an already-lowercase string is left unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type SnakeCase<S extends string> = unknown;`,
    solutionCode: `type SnakeCase<S extends string> = S extends \`\${infer F}\${infer Rest}\`
  ? F extends Uppercase<F>
    ? F extends Lowercase<F>
      ? \`\${F}\${SnakeCase<Rest>}\`
      : \`_\${Lowercase<F>}\${SnakeCase<Rest>}\`
    : \`\${F}\${SnakeCase<Rest>}\`
  : S;`,
    testCases: [
      { input: "SnakeCase<'helloWorld'>", expected: "'hello_world'", label: "Inserts an underscore before each uppercase letter and lowercases it" },
      { input: "SnakeCase<'foo'>", expected: "'foo'", label: "Leaves an already-lowercase string unchanged" },
    ],
    hints: [
      "A character is a real uppercase LETTER (not a digit or symbol) exactly when it's equal to its own Uppercase<> but NOT equal to its own Lowercase<> — non-letter characters are equal to both, which is how you tell them apart.",
    ],
    orderIndex: 1295,
  },

  {
    slug: "implement-camel-case",
    companies: ["Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement CamelCase<S>",
    description: `The inverse conversion, and reported as very common in practice: \`snake_case\` to \`camelCase\`, needed constantly when converting API response shapes to idiomatic JS/TS naming.

## Your task

Write \`CamelCase<S extends string>\`, converting \`snake_case\` to \`camelCase\`.

\`\`\`ts
type Result = CamelCase<"hello_world">
// "helloWorld"

type Result2 = CamelCase<"foo">
// "foo" — a string with no underscores is left unchanged
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type CamelCase<S extends string> = unknown;`,
    solutionCode: `type CamelCase<S extends string> = S extends \`\${infer Head}_\${infer First}\${infer Rest}\`
  ? \`\${Head}\${Uppercase<First>}\${CamelCase<Rest>}\`
  : S;`,
    testCases: [
      { input: "CamelCase<'hello_world'>", expected: "'helloWorld'", label: "Removes the underscore and uppercases the following letter" },
      { input: "CamelCase<'foo'>", expected: "'foo'", label: "Leaves a string with no underscores unchanged" },
    ],
    hints: [
      "Match everything before an underscore, then the single character right after it, then the rest — the underscore itself is consumed by the pattern, never copied into the output.",
    ],
    orderIndex: 1296,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 5 ────
  {
    slug: "implement-first-item",
    companies: [],
    category: "typescript",
    title: "Implement FirstItem<T>",
    description: `The tuple equivalent of \`FirstChar\` — pattern-matching a tuple's shape with \`infer\` to pull out its first element, the same way you'd match a string's first character.

## Your task

Write \`FirstItem<T extends unknown[]>\`, extracting the first element of \`T\` (or \`never\` if it's empty).

\`\`\`ts
type Result = FirstItem<[1, 2, 3]>
// 1

type Result2 = FirstItem<[]>
// never — an empty tuple has no first element
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type FirstItem<T extends unknown[]> = unknown;`,
    solutionCode: `type FirstItem<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;`,
    testCases: [
      { input: "FirstItem<[1, 2, 3]>", expected: "1", label: "Extracts the first element" },
      { input: "FirstItem<[]>", expected: "never", label: "Returns never for an empty tuple" },
    ],
    hints: [
      "A tuple pattern like [infer F, ...unknown[]] matches 'at least one element, capture the first' — the rest spread doesn't need to be inferred if you don't use it.",
    ],
    orderIndex: 1297,
  },

  {
    slug: "implement-last-item",
    companies: [],
    category: "typescript",
    title: "Implement LastItem<T>",
    description: `Unlike \`LastChar\`, tuples don't need recursion for this — a leading rest element in a tuple pattern lets you capture the very last item directly, in one step.

## Your task

Write \`LastItem<T extends unknown[]>\`, extracting the last element of \`T\` (or \`never\` if it's empty).

\`\`\`ts
type Result = LastItem<[1, 2, 3]>
// 3

type Result2 = LastItem<[]>
// never — an empty tuple has no last element
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type LastItem<T extends unknown[]> = unknown;`,
    solutionCode: `type LastItem<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;`,
    testCases: [
      { input: "LastItem<[1, 2, 3]>", expected: "3", label: "Extracts the last element directly, no recursion needed" },
      { input: "LastItem<[]>", expected: "never", label: "Returns never for an empty tuple" },
    ],
    hints: [
      "Tuple patterns can put the rest element first: [...unknown[], infer L] matches 'anything, then capture the final element' in a single pattern.",
    ],
    orderIndex: 1298,
  },

  {
    slug: "implement-length-of-tuple",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement LengthOfTuple<T>",
    description: `\`LengthOfTuple\` reads a tuple's arity as a numeric literal type — unlike a plain array, whose \`.length\` TypeScript can only type as \`number\`, a tuple tracks its exact length so it can be read directly off \`T["length"]\`, no counting or recursion needed.

## Your task

Write \`LengthOfTuple<T extends readonly unknown[]>\`, returning \`T\`'s length as a numeric literal type.

\`\`\`ts
type Result = LengthOfTuple<[1, 2, 3]>
// 3
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type LengthOfTuple<T extends readonly unknown[]> = unknown;`,
    solutionCode: `type LengthOfTuple<T extends readonly unknown[]> = T["length"];`,
    testCases: [
      { input: "LengthOfTuple<[1, 2, 3]>", expected: "3", label: "Reads the tuple's length directly" },
      { input: "LengthOfTuple<[]>", expected: "0", label: "Works for an empty tuple too" },
    ],
    hints: [
      "This one's a trap for overthinking — a tuple (unlike a plain array) tracks its length as a literal type automatically, so indexing ['length'] is the entire answer.",
    ],
    orderIndex: 1299,
  },

  {
    slug: "implement-tupletounion",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement TupleToUnion<T>",
    description: `\`TupleToUnion\` collapses a tuple's element types into a single union type — a common step when you have a readonly tuple of allowed values (say, from an \`as const\` array) and want a union type derived from it instead of maintaining both by hand.

## Your task

Write \`TupleToUnion<T extends readonly unknown[]>\`, turning \`T\`'s element types into a union.

\`\`\`ts
type Result = TupleToUnion<[1, 2, 3]>
// 1 | 2 | 3
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type TupleToUnion<T extends readonly unknown[]> = unknown;`,
    solutionCode: `type TupleToUnion<T extends readonly unknown[]> = T[number];`,
    testCases: [
      { input: "TupleToUnion<[1, 2, 3]>", expected: "1 | 2 | 3", label: "Collapses every element type into one union" },
    ],
    hints: [
      "T[number] indexes with the whole 'number' type, not a specific index — TypeScript resolves that to the union of every element's type.",
    ],
    orderIndex: 1300,
  },

  {
    slug: "implement-shift",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement Shift<T>",
    description: `\`Shift\` is the type-level counterpart to \`Array.prototype.shift\` — it describes the tuple you'd get back with the first element removed, without mutating anything (types can't mutate).

## Your task

Write \`Shift<T extends unknown[]>\`, returning \`T\` without its first element.

\`\`\`ts
type Result = Shift<[1, 2, 3]>
// [2, 3]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Shift<T extends unknown[]> = unknown;`,
    solutionCode: `type Shift<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : [];`,
    testCases: [
      { input: "Shift<[1, 2, 3]>", expected: "[2, 3]", label: "Drops exactly the first element, keeps the rest in order" },
      { input: "Shift<[]>", expected: "[]", label: "Handles an already-empty tuple without error" },
    ],
    hints: [
      "You don't need to name the first element at all if you're discarding it — a bare `unknown` in the pattern's first slot is enough to match and skip it.",
    ],
    orderIndex: 1301,
  },

  {
    slug: "implement-push",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement Push<T, I>",
    description: `\`Push\` appends a new element type to the end of a tuple — the same spread syntax you'd use to append at runtime (\`[...arr, item]\`) works identically inside a tuple type literal.

## Your task

Write \`Push<T extends unknown[], I>\`, returning a new tuple with \`I\` appended to the end of \`T\`.

\`\`\`ts
type Result = Push<[1, 2], 3>
// [1, 2, 3]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type Push<T extends unknown[], I> = unknown;`,
    solutionCode: `type Push<T extends unknown[], I> = [...T, I];`,
    testCases: [
      { input: "Push<[1, 2], 3>", expected: "[1, 2, 3]", label: "Appends the new element to the end" },
      { input: "Push<[], 1>", expected: "[1]", label: "Works starting from an empty tuple" },
    ],
    hints: [
      "No recursion or infer needed at all — this is a one-line spread, the same syntax you'd use to append at runtime.",
    ],
    orderIndex: 1302,
  },

  {
    slug: "implement-reverse-tuple",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement ReverseTuple<T>",
    description: `\`ReverseTuple\` reverses a tuple's element order at the type level — peel the first element off on each recursive step and place it at the end of the already-reversed remainder.

## Your task

Write \`ReverseTuple<T extends unknown[]>\`, returning \`T\` with its elements in reverse order.

\`\`\`ts
type Result = ReverseTuple<[1, 2, 3]>
// [3, 2, 1]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type ReverseTuple<T extends unknown[]> = unknown;`,
    solutionCode: `type ReverseTuple<T extends unknown[]> = T extends [infer F, ...infer Rest] ? [...ReverseTuple<Rest>, F] : [];`,
    testCases: [
      { input: "ReverseTuple<[1, 2, 3]>", expected: "[3, 2, 1]", label: "Reverses the element order" },
      { input: "ReverseTuple<[]>", expected: "[]", label: "Handles an empty tuple as its own base case" },
    ],
    hints: [
      "Each recursive call reverses everything after the first element, then places that first element at the very end of the result — the recursion bottoms out and builds the reversal on the way back up.",
    ],
    orderIndex: 1303,
  },

  {
    slug: "implement-slice",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement Slice<A, S, E>",
    description: `\`Slice\` is the type-level version of \`Array.prototype.slice\` — since there's no direct subtraction at the type level yet, it's built by taking the first \`E\` elements of \`A\`, then dropping the first \`S\` of those.

## Your task

Write \`Slice<A extends unknown[], S extends number, E extends number>\`, returning the elements of \`A\` from index \`S\` up to (not including) index \`E\`.

\`\`\`ts
type Result = Slice<[1, 2, 3, 4, 5], 1, 3>
// [2, 3]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type Slice<A extends unknown[], S extends number, E extends number> = unknown;`,
    solutionCode: `type Take<A extends unknown[], N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? Acc : A extends [infer F, ...infer Rest] ? Take<Rest, N, [...Acc, F]> : Acc;

type Drop<A extends unknown[], N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? A : A extends [unknown, ...infer Rest] ? Drop<Rest, N, [...Acc, unknown]> : A;

type Slice<A extends unknown[], S extends number, E extends number> = Drop<Take<A, E>, S>;`,
    testCases: [
      { input: "Slice<[1, 2, 3, 4, 5], 1, 3>", expected: "[2, 3]", label: "Extracts the correct sub-range" },
      { input: "Slice<[1, 2, 3], 0, 3>", expected: "[1, 2, 3]", label: "A full-range slice returns everything" },
    ],
    hints: [
      "Composing Take<A, E> then Drop<result, S> sidesteps needing E - S as a real subtraction — you never actually compute the slice's length, just where it starts and ends.",
    ],
    orderIndex: 1304,
  },

  {
    slug: "implement-flat",
    companies: ["Meta", "Amazon"],
    category: "typescript",
    title: "Implement Flat<T> (Deep Flatten)",
    description: `\`Flat\` recursively flattens arbitrarily nested tuples into a single flat tuple, at any depth — the type-level equivalent of \`Array.prototype.flat(Infinity)\`.

## Your task

Write \`Flat<T extends unknown[]>\`, fully flattening any nested arrays inside \`T\`, at any depth.

\`\`\`ts
type Result = Flat<[1, [2, [3, 4]], 5]>
// [1, 2, 3, 4, 5]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Flat<T extends unknown[]> = unknown;`,
    solutionCode: `type Flat<T extends unknown[]> = T extends [infer F, ...infer Rest]
  ? F extends unknown[]
    ? [...Flat<F>, ...Flat<Rest>]
    : [F, ...Flat<Rest>]
  : [];`,
    testCases: [
      { input: "Flat<[1, [2, [3, 4]], 5]>", expected: "[1, 2, 3, 4, 5]", label: "Flattens nested arrays at any depth, not just one level" },
      { input: "Flat<[1, 2, 3]>", expected: "[1, 2, 3]", label: "Leaves an already-flat tuple unchanged" },
    ],
    hints: [
      "Every element needs its own is-this-an-array check — F extends unknown[] decides whether to recurse into F or keep it as a single item.",
    ],
    orderIndex: 1305,
  },

  {
    slug: "implement-includes",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement Includes<T, U>",
    description: `\`Includes\` checks whether a tuple contains an element that exactly matches a given type — like \`Array.prototype.includes\`, but resolved entirely at compile time using exact type equality rather than \`===\`. The exact-match \`Equal\` helper is already in scope from this platform's own test harness.

## Your task

Write \`Includes<T extends readonly unknown[], U>\`, returning \`true\` if any element of \`T\` exactly matches \`U\`, \`false\` otherwise.

\`\`\`ts
type Result = Includes<[1, 2, 3], 2>
// true
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Includes<T extends readonly unknown[], U> = unknown;`,
    solutionCode: `type Includes<T extends readonly unknown[], U> = T extends [infer F, ...infer Rest]
  ? Equal<F, U> extends true ? true : Includes<Rest, U>
  : false;`,
    testCases: [
      { input: "Includes<[1, 2, 3], 2>", expected: "true", label: "Finds a matching element" },
      { input: "Includes<[1, 2, 3], 4>", expected: "false", label: "Returns false when nothing matches" },
    ],
    hints: [
      "A plain `F extends U` check is too loose here (it would treat a subtype as a match) — Equal<F, U> is what gives you exact-match semantics, which is why it's provided for you.",
    ],
    orderIndex: 1306,
  },

  {
    slug: "implement-filter",
    companies: ["Amazon", "Airbnb"],
    category: "typescript",
    title: "Implement Filter<T, A>",
    description: `\`Filter\` is the type-level version of \`Array.prototype.filter\` — it keeps only the elements of a tuple assignable to a given type, preserving the order of the ones that remain.

## Your task

Write \`Filter<T extends readonly unknown[], A>\`, keeping only the elements of \`T\` assignable to \`A\`.

\`\`\`ts
type Result = Filter<[1, 'a', 2, 'b'], number>
// [1, 2]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Filter<T extends readonly unknown[], A> = unknown;`,
    solutionCode: `type Filter<T extends readonly unknown[], A> = T extends [infer F, ...infer Rest]
  ? F extends A ? [F, ...Filter<Rest, A>] : Filter<Rest, A>
  : [];`,
    testCases: [
      { input: "Filter<[1, 'a', 2, 'b'], number>", expected: "[1, 2]", label: "Keeps only the elements matching the filter type, in order" },
      { input: "Filter<[1, 2, 3], string>", expected: "[]", label: "Returns an empty tuple when nothing matches" },
    ],
    hints: [
      "Each recursive step makes an independent keep-or-drop decision on just the first element, then recurses on the rest — there's no need to track indices or build up two separate lists.",
    ],
    orderIndex: 1307,
  },

  {
    slug: "implement-repeat",
    companies: [],
    category: "typescript",
    title: "Implement Repeat<T, C>",
    description: `\`Repeat\` builds a tuple of length \`C\` where every element is the same type \`T\` — an accumulator pattern, growing one element per recursive call until it reaches the target length.

## Your task

Write \`Repeat<T, C extends number>\`, returning a \`C\`-length tuple where every element is \`T\`.

\`\`\`ts
type Result = Repeat<'x', 3>
// ['x', 'x', 'x']

type Empty = Repeat<0, 0>
// []
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Repeat<T, C extends number> = unknown;`,
    solutionCode: `type Repeat<T, C extends number, Acc extends unknown[] = []> =
  Acc["length"] extends C ? Acc : Repeat<T, C, [...Acc, T]>;`,
    testCases: [
      { input: "Repeat<'x', 3>", expected: "['x', 'x', 'x']", label: "Builds a tuple of the requested length, repeating the value" },
      { input: "Repeat<0, 0>", expected: "[]", label: "Returns an empty tuple when the count is 0" },
    ],
    hints: [
      "An accumulator parameter with a default of [] is the standard way to 'count up' at the type level — check its length against the target on every recursive call.",
    ],
    orderIndex: 1308,
  },

  {
    slug: "implement-repeat-string",
    companies: [],
    category: "typescript",
    title: "Implement RepeatString<S, C>",
    description: `\`RepeatString\` is the string counterpart to \`Repeat\` — it builds a single string literal type by concatenating \`S\` onto itself \`C\` times, using the same accumulator-and-counter recursion shape.

## Your task

Write \`RepeatString<S extends string, C extends number>\`, returning \`S\` repeated \`C\` times.

\`\`\`ts
type Result = RepeatString<'ab', 3>
// 'ababab'

type Empty = RepeatString<'x', 0>
// ''
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type RepeatString<S extends string, C extends number> = unknown;`,
    solutionCode: `type RepeatString<S extends string, C extends number, Acc extends string = "", I extends unknown[] = []> =
  I["length"] extends C ? Acc : RepeatString<S, C, \`\${Acc}\${S}\`, [...I, unknown]>;`,
    testCases: [
      { input: "RepeatString<'ab', 3>", expected: "'ababab'", label: "Concatenates the string onto itself the requested number of times" },
      { input: "RepeatString<'x', 0>", expected: "''", label: "Returns an empty string when the count is 0" },
    ],
    hints: [
      "Two accumulators are needed here, not one: a string accumulator for the growing result, and a separate tuple counter (I) since a string type has no ['length'] literal the way a tuple does.",
    ],
    orderIndex: 1309,
  },

  {
    slug: "implement-tuple-to-string",
    companies: [],
    category: "typescript",
    title: "Implement TupleToString<T>",
    description: `\`TupleToString\` is the inverse of \`StringToTuple\` — it joins a tuple of individual character (or string) types back into a single concatenated string literal type, character by character.

## Your task

Write \`TupleToString<T extends readonly string[]>\`, concatenating every element of \`T\` into a single string.

\`\`\`ts
type Result = TupleToString<['a', 'b', 'c']>
// 'abc'
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type TupleToString<T extends readonly string[]> = unknown;`,
    solutionCode: `type TupleToString<T extends readonly string[]> = T extends [infer F extends string, ...infer Rest extends string[]]
  ? \`\${F}\${TupleToString<Rest>}\`
  : "";`,
    testCases: [
      { input: "TupleToString<['a', 'b', 'c']>", expected: "'abc'", label: "Concatenates every element in order" },
      { input: "TupleToString<[]>", expected: "''", label: "Returns an empty string for an empty tuple" },
    ],
    hints: [
      "This is Join without a delimiter — same recursive shape as Join, just without the D between each piece.",
    ],
    orderIndex: 1310,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 6 ────
  {
    slug: "implement-isnever",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement IsNever<T>",
    description: `\`IsNever\` checks whether a type is exactly \`never\` — a genuine gotcha, since a naked \`T extends never ? true : false\` distributes over unions, and \`never\` is the empty union, so it silently evaluates to \`never\` instead of a boolean when \`T\` actually is \`never\`.

## Your task

Write \`IsNever<T>\`, returning \`true\` only when \`T\` is exactly \`never\`. Wrap both sides in a tuple (\`[T] extends [never]\`) to suppress the distribution that breaks the naked check.

\`\`\`ts
type Result = IsNever<never>
// true

type NotNever = IsNever<string>
// false
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type IsNever<T> = unknown;`,
    solutionCode: `type IsNever<T> = [T] extends [never] ? true : false;`,
    testCases: [
      { input: "IsNever<never>", expected: "true", label: "Correctly identifies never itself" },
      { input: "IsNever<string>", expected: "false", label: "Returns false for any other type" },
    ],
    hints: [
      "The tuple wrapper `[T] extends [never]` is the standard fix — it stops T from distributing before the comparison happens, which is exactly what breaks a naked `T extends never` check.",
    ],
    orderIndex: 1311,
  },

  {
    slug: "implement-isany",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement IsAny<T>",
    description: `\`IsAny\` checks whether a type is exactly \`any\` — \`any\` is unique in being both assignable to and assignable from every other type, so the trick intersects it with a literal: \`1 & T\` stays \`1\` for any normal \`T\`, but collapses to \`any\` itself when \`T\` is \`any\`.

## Your task

Write \`IsAny<T>\`, returning \`true\` only when \`T\` is exactly \`any\`.

\`\`\`ts
type Result = IsAny<any>
// true
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type IsAny<T> = unknown;`,
    solutionCode: `type IsAny<T> = 0 extends 1 & T ? true : false;`,
    testCases: [
      { input: "IsAny<any>", expected: "true", label: "Correctly identifies any itself" },
      { input: "IsAny<string>", expected: "false", label: "Returns false for a normal, specific type" },
    ],
    hints: [
      "0 extends 1 & T is only ever true when T is any — for every other type, 1 & T stays 1 (or never, for incompatible types), and 0 doesn't extend either of those.",
    ],
    orderIndex: 1312,
  },

  {
    slug: "implement-isemptytype",
    companies: [],
    category: "typescript",
    title: "Implement IsEmptyType<T>",
    description: `\`IsEmptyType\` checks whether an object type has zero properties — a short, self-contained building block used inside later, harder recursive types.

## Your task

Write \`IsEmptyType<T>\`, returning \`true\` only when \`T\` has no keys at all.

\`\`\`ts
type Result = IsEmptyType<{}>
// true
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "easy",
    starterCode: `type IsEmptyType<T> = unknown;`,
    solutionCode: `type IsEmptyType<T> = keyof T extends never ? true : false;`,
    testCases: [
      { input: "IsEmptyType<{}>", expected: "true", label: "Identifies an empty object type" },
      { input: "IsEmptyType<{ a: string }>", expected: "false", label: "Returns false once there's at least one key" },
    ],
    hints: [
      "keyof {} evaluates to never — checking that directly is simpler than trying to count keys.",
    ],
    orderIndex: 1313,
  },

  {
    slug: "implement-equal-type",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement Equal<A, B>",
    description: `\`Equal\` is the exact-type-equality check used as a testing utility throughout real type-challenge test suites (including this platform's own grading harness) — a plain \`A extends B ? true : false\` is too loose, since it also matches when \`A\` is merely a *subtype* of \`B\`. The real trick compares both types' behavior as constraints on a generic function instead, which is sensitive to the exact type, not just assignability.

## Your task

Write \`MyEqual<X, Y>\`, returning \`true\` only when \`X\` and \`Y\` are *exactly* the same type (not just mutually assignable). Name it \`MyEqual\`, not \`Equal\` — this platform's own \`Equal\` (used to grade every other question) is already in scope, and a same-named alias would collide with it.

\`\`\`ts
type Result = MyEqual<{ a: string }, { a: string }>
// true
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type MyEqual<X, Y> = unknown;`,
    solutionCode: `type MyEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;`,
    testCases: [
      { input: "MyEqual<1, 1>", expected: "true", label: "Identical literal types are equal" },
      { input: "MyEqual<1, 2>", expected: "false", label: "Different literal types are not equal" },
      { input: "MyEqual<{ a: string }, { a: string }>", expected: "true", label: "Structurally identical object types are equal" },
    ],
    hints: [
      "A plain X extends Y check can't tell 'exactly equal' apart from 'X happens to be assignable to Y' — comparing two generic function types (which are contravariant in their parameters) is what forces an exact match instead of a loose one.",
    ],
    orderIndex: 1314,
  },

  {
    slug: "implement-assert-never",
    companies: ["Microsoft", "Airbnb", "Stripe"],
    category: "typescript",
    title: "Implement assertNever (Exhaustiveness Checking)",
    description: `\`assertNever\` is the standard TypeScript exhaustiveness-checking pattern — less flashy than the pure type-challenge puzzles, but the one you'll actually reach for constantly in real code review: a \`switch\` statement's \`default\` branch calls \`assertNever(value)\`, where \`value\`'s type has already been narrowed to \`never\` by every other case. If a new variant is ever added to the union without a matching \`case\`, the \`default\` branch's argument is no longer \`never\`, and the whole file fails to compile until you handle it.

## Your task

Write \`function assertNever(value: never): never\`, throwing at runtime but — more importantly — only accepting \`never\` as its parameter type.

\`\`\`ts
function assertNever(value: never): never {
  throw new Error("unreachable")
}
// type: (value: never) => never
\`\`\`

Graded by real TypeScript type-checking — write a real function declaration, matching the exact signature described above, not a type alias.`,
    difficulty: "medium",
    starterCode: `function assertNever(value: never): never {
  throw new Error("unreachable");
}`,
    solutionCode: `function assertNever(value: never): never {
  throw new Error("Unexpected value: " + value);
}`,
    testCases: [
      { input: "the full type of assertNever", expected: "(value: never) => never", label: "Matches the exact required signature — a never parameter and a never return type" },
    ],
    hints: [
      "The body can genuinely be anything that throws — the exhaustiveness guarantee comes entirely from the declared parameter type being never, not from any runtime logic.",
    ],
    orderIndex: 1315,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 7 ────
  {
    slug: "implement-tonumber",
    companies: [],
    category: "typescript",
    title: "Implement ToNumber<T>",
    description: `\`ToNumber\` converts a numeric string literal type into a real numeric literal type — the foundational trick behind every type-level arithmetic challenge, since there's no direct string-to-number conversion: count up from 0 using a growing tuple, and stop the moment the tuple's stringified length matches the input.

## Your task

Write \`ToNumber<T extends string>\`, converting a numeric string type into a real numeric literal type.

\`\`\`ts
type Result = ToNumber<'5'>
// 5
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type ToNumber<T extends string> = unknown;`,
    solutionCode: `type ToNumber<T extends string, Acc extends unknown[] = []> =
  T extends \`\${Acc["length"]}\` ? Acc["length"] : ToNumber<T, [...Acc, unknown]>;`,
    testCases: [
      { input: "ToNumber<'5'>", expected: "5", label: "Converts a numeric string to the matching numeric literal" },
      { input: "ToNumber<'0'>", expected: "0", label: "Handles zero as its own immediate base case" },
    ],
    hints: [
      "Acc[\"length\"] is a number, but `${Acc[\"length\"]}` turns it into a string you can directly compare against T — that stringify-and-compare step is the whole trick.",
    ],
    orderIndex: 1316,
  },

  {
    slug: "implement-string-to-number",
    companies: [],
    category: "typescript",
    title: "Implement StringToNumber<S>",
    description: `\`StringToNumber\` is the same numeric-string-to-literal conversion as \`ToNumber\`, under a different name — it comes up often enough under both names in interview prep that it's worth recognizing as the identical trick.

## Your task

Write \`StringToNumber<S extends string>\`, converting a numeric string type into a real numeric literal type.

\`\`\`ts
type Result = StringToNumber<'12'>
// 12
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type StringToNumber<S extends string> = unknown;`,
    solutionCode: `type StringToNumber<S extends string, Acc extends unknown[] = []> =
  S extends \`\${Acc["length"]}\` ? Acc["length"] : StringToNumber<S, [...Acc, unknown]>;`,
    testCases: [
      { input: "StringToNumber<'12'>", expected: "12", label: "Converts a multi-digit numeric string correctly" },
      { input: "StringToNumber<'0'>", expected: "0", label: "Handles zero as its own immediate base case" },
    ],
    hints: [
      "Same counting-tuple technique as ToNumber — recognizing when two differently-named questions are really the same underlying trick is half the battle in this stage.",
    ],
    orderIndex: 1317,
  },

  {
    slug: "implement-abs",
    companies: [],
    category: "typescript",
    title: "Implement Abs<N>",
    description: `\`Abs\` returns a numeric literal type's absolute value — since numeric types can't be pattern-matched directly, it stringifies \`N\` first, checks whether that string starts with \`-\`, and converts the digits after it back into a number.

## Your task

Write \`Abs<N extends number>\`, returning \`N\`'s absolute value.

\`\`\`ts
type Result = Abs<-5>
// 5

type AlreadyPositive = Abs<5>
// 5
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Abs<N extends number> = unknown;`,
    solutionCode: `type StrToNum<S extends string, Acc extends unknown[] = []> =
  S extends \`\${Acc["length"]}\` ? Acc["length"] : StrToNum<S, [...Acc, unknown]>;

type Abs<N extends number> = \`\${N}\` extends \`-\${infer Rest}\` ? StrToNum<Rest> : N;`,
    testCases: [
      { input: "Abs<-5>", expected: "5", label: "Strips the negative sign and converts back to a number" },
      { input: "Abs<5>", expected: "5", label: "Leaves an already-positive number unchanged" },
    ],
    hints: [
      "Stringify N first (`${N}`) so you can pattern-match the leading '-' character the same way you would with any other string — numeric literal types don't support that kind of matching directly.",
    ],
    orderIndex: 1318,
  },

  {
    slug: "implement-largerthan",
    companies: [],
    category: "typescript",
    title: "Implement LargerThan<A, B>",
    description: `\`LargerThan\` compares two numeric literal types — since there's no \`>\` operator at the type level, it counts up from 0 with a shared tuple counter and checks which of \`A\` or \`B\` the counter's length reaches first.

## Your task

Write \`LargerThan<A extends number, B extends number>\`, returning \`true\` if \`A > B\`.

\`\`\`ts
type Result = LargerThan<5, 3>
// true

type SameValue = LargerThan<3, 3>
// false
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type LargerThan<A extends number, B extends number> = unknown;`,
    solutionCode: `type LargerThan<A extends number, B extends number, C extends unknown[] = []> =
  A extends B ? false :
  C["length"] extends A ? false :
  C["length"] extends B ? true :
  LargerThan<A, B, [...C, unknown]>;`,
    testCases: [
      { input: "LargerThan<5, 3>", expected: "true", label: "Correctly identifies A > B" },
      { input: "LargerThan<3, 5>", expected: "false", label: "Correctly identifies A < B" },
      { input: "LargerThan<3, 3>", expected: "false", label: "Equal numbers are not 'larger than' each other" },
    ],
    hints: [
      "Whichever of A or B the shared counter's length reaches FIRST is the smaller one — reaching A's length first means A <= B, so the answer is false.",
    ],
    orderIndex: 1319,
  },

  {
    slug: "implement-smallerthan",
    companies: [],
    category: "typescript",
    title: "Implement SmallerThan<A, B>",
    description: `\`SmallerThan\` is the mirror image of \`LargerThan\` — the same counting technique, with the two operands' roles swapped.

## Your task

Write \`SmallerThan<A extends number, B extends number>\`, returning \`true\` if \`A < B\`.

\`\`\`ts
type Result = SmallerThan<3, 5>
// true

type SameValue = SmallerThan<3, 3>
// false
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type SmallerThan<A extends number, B extends number> = unknown;`,
    solutionCode: `type SmallerThan<A extends number, B extends number, C extends unknown[] = []> =
  A extends B ? false :
  C["length"] extends B ? false :
  C["length"] extends A ? true :
  SmallerThan<A, B, [...C, unknown]>;`,
    testCases: [
      { input: "SmallerThan<3, 5>", expected: "true", label: "Correctly identifies A < B" },
      { input: "SmallerThan<5, 3>", expected: "false", label: "Correctly identifies A > B" },
      { input: "SmallerThan<3, 3>", expected: "false", label: "Equal numbers are not 'smaller than' each other" },
    ],
    hints: [
      "This is LargerThan with A and B's roles in the counter-reaches-first check swapped — the overall shape is identical.",
    ],
    orderIndex: 1320,
  },

  {
    slug: "implement-add",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement Add<A, B>",
    description: `\`Add\` performs real addition on numeric literal types — the type-challenges classic technique: build two tuples of lengths \`A\` and \`B\`, concatenate them, and read the combined tuple's length back out.

## Your task

Write \`Add<A extends number, B extends number>\`, returning \`A + B\`.

\`\`\`ts
type Result = Add<3, 4>
// 7
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Add<A extends number, B extends number> = unknown;`,
    solutionCode: `type BuildTuple<L extends number, T extends unknown[] = []> = T["length"] extends L ? T : BuildTuple<L, [...T, unknown]>;

type Add<A extends number, B extends number> = [...BuildTuple<A>, ...BuildTuple<B>]["length"];`,
    testCases: [
      { input: "Add<3, 4>", expected: "7", label: "Adds two positive numbers correctly" },
      { input: "Add<0, 5>", expected: "5", label: "Adding zero returns the other operand unchanged" },
    ],
    hints: [
      "A tuple's length IS a real number at the type level — concatenating two tuples and reading the result's length is genuinely addition, not just a simulation of it.",
    ],
    orderIndex: 1321,
  },

  {
    slug: "implement-subtract",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement Subtract<A, B>",
    description: `\`Subtract\` is the inverse of \`Add\` — build a tuple of length \`A\`, pattern-match a \`B\`-length prefix off the front of it, and whatever's left over is \`A - B\`.

## Your task

Write \`Subtract<A extends number, B extends number>\`, returning \`A - B\` (assume \`A >= B\`).

\`\`\`ts
type Result = Subtract<7, 3>
// 4

type SameValue = Subtract<5, 5>
// 0
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Subtract<A extends number, B extends number> = unknown;`,
    solutionCode: `type BuildTuple<L extends number, T extends unknown[] = []> = T["length"] extends L ? T : BuildTuple<L, [...T, unknown]>;

type Subtract<A extends number, B extends number> = BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest] ? Rest["length"] : never;`,
    testCases: [
      { input: "Subtract<7, 3>", expected: "4", label: "Subtracts correctly" },
      { input: "Subtract<5, 5>", expected: "0", label: "Subtracting a number from itself gives zero" },
    ],
    hints: [
      "The pattern [...BuildTuple<B>, ...infer Rest] matched against BuildTuple<A> peels off exactly B elements from the front — Rest is whatever's left, which is your answer.",
    ],
    orderIndex: 1322,
  },

  {
    slug: "implement-multiply",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement Multiply<A, B>",
    description: `\`Multiply\` implements multiplication as repeated addition, using two accumulators: one growing by \`B\` elements on every step (the running product), and a plain counter tracking how many of the \`A\` steps have happened so far.

## Your task

Write \`Multiply<A extends number, B extends number>\`, returning \`A * B\`.

\`\`\`ts
type Result = Multiply<3, 4>
// 12
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type Multiply<A extends number, B extends number> = unknown;`,
    solutionCode: `type BuildTuple<L extends number, T extends unknown[] = []> = T["length"] extends L ? T : BuildTuple<L, [...T, unknown]>;

type Multiply<A extends number, B extends number, Acc extends unknown[] = [], Count extends unknown[] = []> =
  Count["length"] extends A ? Acc["length"] : Multiply<A, B, [...Acc, ...BuildTuple<B>], [...Count, unknown]>;`,
    testCases: [
      { input: "Multiply<3, 4>", expected: "12", label: "Multiplies two positive numbers correctly" },
      { input: "Multiply<0, 5>", expected: "0", label: "Multiplying by zero gives zero" },
    ],
    hints: [
      "Count just needs to reach A — it doesn't need to know anything about B. Acc is where the real work happens, growing by a whole BuildTuple<B> on every step.",
    ],
    orderIndex: 1323,
  },

  {
    slug: "implement-divide",
    companies: ["Microsoft"],
    category: "typescript",
    title: "Implement Divide<A, B>",
    description: `\`Divide\` implements division as repeated subtraction — peel a \`B\`-length chunk off the front of a shrinking \`A\`-length tuple on every recursive step, counting how many chunks it takes until nothing's left.

## Your task

Write \`Divide<A extends number, B extends number>\`, returning \`A / B\` (assume it divides evenly).

\`\`\`ts
type Result = Divide<12, 4>
// 3
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type Divide<A extends number, B extends number> = unknown;`,
    solutionCode: `type BuildTuple<L extends number, T extends unknown[] = []> = T["length"] extends L ? T : BuildTuple<L, [...T, unknown]>;

type Divide<A extends number, B extends number, Count extends unknown[] = []> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    ? Divide<Rest["length"], B, [...Count, unknown]>
    : Count["length"];`,
    testCases: [
      { input: "Divide<12, 4>", expected: "3", label: "Divides evenly" },
      { input: "Divide<10, 2>", expected: "5", label: "Works for a different pair of numbers, not hardcoded" },
    ],
    hints: [
      "Each successful B-length chunk removed from the front counts as one step — the recursion stops the moment what's left is too short to contain another full chunk.",
    ],
    orderIndex: 1324,
  },


  // ── typescript — standalone TypeScript Type-Challenges Roadmap, Stage 8 ────
  {
    slug: "implement-find-index",
    companies: ["Amazon"],
    category: "typescript",
    title: "Implement FindIndex<T, E>",
    description: `\`FindIndex\` locates the index of the first element that exactly matches a given type — combining the exact-match \`Equal\` check from \`Includes\` with the counting-accumulator pattern from type-level arithmetic, to find *where* a match is, not just whether one exists.

## Your task

Write \`FindIndex<T extends readonly unknown[], E>\`, returning the index of the first element exactly matching \`E\`, or \`-1\` if none does.

\`\`\`ts
type Result = FindIndex<[1, 2, 3], 2>
// 1

type NotFound = FindIndex<[1, 2, 3], 5>
// -1
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type FindIndex<T extends readonly unknown[], E> = unknown;`,
    solutionCode: `type FindIndex<T extends readonly unknown[], E, Idx extends unknown[] = []> =
  T extends [infer F, ...infer Rest]
    ? Equal<F, E> extends true ? Idx["length"] : FindIndex<Rest, E, [...Idx, unknown]>
    : -1;`,
    testCases: [
      { input: "FindIndex<[1, 2, 3], 2>", expected: "1", label: "Finds the correct index of a matching element" },
      { input: "FindIndex<[1, 2, 3], 5>", expected: "-1", label: "Returns -1 when nothing matches" },
    ],
    hints: [
      "Idx is just a counter, exactly like the ones from the arithmetic stage — it doesn't hold any real data, only its length matters.",
    ],
    orderIndex: 1325,
  },

  {
    slug: "implement-diff",
    companies: ["Airbnb", "Amazon"],
    category: "typescript",
    title: "Implement Diff<A, B>",
    description: `\`Diff\` computes the symmetric difference between two object types — every key that appears in exactly one of \`A\` or \`B\`, but not both (a key present in both is considered "shared" and excluded from the result).

## Your task

Write \`Diff<A, B>\`, returning an object type of the keys that appear in only one of \`A\` or \`B\`.

\`\`\`ts
type Result = Diff<{ a: string; b: number }, { b: number; c: boolean }>
// { a: string; c: boolean }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Diff<A, B> = unknown;`,
    solutionCode: `type Diff<A, B> = Pick<A & B, Exclude<keyof A | keyof B, keyof A & keyof B>>;`,
    testCases: [
      { input: "Diff<{ a: string; b: number }, { b: number; c: boolean }>", expected: "{ a: string; c: boolean }", label: "Keeps only the keys unique to one side, dropping the shared key" },
    ],
    hints: [
      "keyof A & keyof B is the shared-keys set; Excluding that from keyof A | keyof B leaves exactly the symmetric difference — then Pick that key set off the intersection A & B to recover each key's real type.",
    ],
    orderIndex: 1326,
  },

  {
    slug: "implement-object-paths",
    companies: ["Airbnb", "Shopify"],
    category: "typescript",
    title: "Implement ObjectPaths<O>",
    description: `\`ObjectPaths\` generates every valid dot-notation path through a nested object type — the type-level foundation for typed form fields and typed state-update paths, so a path like \`"user.address.city"\` is a real, checkable string literal type instead of just a plain \`string\`.

## Your task

Write \`ObjectPaths<T>\`, returning a union of every dot-notation path through \`T\`, at every nesting depth.

\`\`\`ts
type Result = ObjectPaths<{ a: string; b: { c: number } }>
// 'a' | 'b' | 'b.c'
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type ObjectPaths<T> = unknown;`,
    solutionCode: `type ObjectPaths<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? K | \`\${K}.\${ObjectPaths<T[K]>}\`
        : K
      : never
    }[keyof T]
  : never;`,
    testCases: [
      { input: "ObjectPaths<{ a: string; b: { c: number } }>", expected: "'a' | 'b' | 'b.c'", label: "Includes both top-level keys and dotted nested paths" },
    ],
    hints: [
      "Every key contributes either just itself (if its value isn't an object) or itself PLUS every one of its own nested paths, prefixed with 'thisKey.' — build both possibilities into the mapped type's value, then collapse it to a union with [keyof T].",
    ],
    orderIndex: 1327,
  },

  {
    slug: "implement-map-string-union-to-object-union",
    companies: ["Shopify"],
    category: "typescript",
    title: "Implement MapStringUnionToObjectUnion<U>",
    description: `\`MapStringUnionToObjectUnion\` converts a plain union of string literals into a union of single-property objects — the shape you'd want as a starting point for building a discriminated union out of a simpler string enum, using distributive conditional types so each member becomes its own object rather than one object with a unioned field.

## Your task

Write \`MapStringUnionToObjectUnion<U extends string>\`, mapping each member of \`U\` to its own \`{ type: U }\` object, joined back into a union.

\`\`\`ts
type Result = MapStringUnionToObjectUnion<'circle' | 'square'>
// { type: 'circle' } | { type: 'square' }
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type MapStringUnionToObjectUnion<U extends string> = unknown;`,
    solutionCode: `type MapStringUnionToObjectUnion<U extends string> = U extends U ? { type: U } : never;`,
    testCases: [
      { input: "MapStringUnionToObjectUnion<'circle' | 'square'>", expected: "{ type: 'circle' } | { type: 'square' }", label: "Produces one object per union member, not a single object with a unioned type field" },
    ],
    hints: [
      "U extends U looks like a no-op, but it isn't — using U on both sides of a conditional is the standard idiom for explicitly forcing per-member distribution over the union, which is exactly what turns 'circle' | 'square' into two separate objects instead of one object with type: 'circle' | 'square'.",
    ],
    orderIndex: 1328,
  },

  {
    slug: "implement-extract-route-params",
    companies: ["Airbnb", "Shopify", "Vercel"],
    category: "typescript",
    title: "Implement ExtractRouteParams<T>",
    description: `\`ExtractRouteParams\` parses a route pattern like \`"/users/:id/posts/:postId"\` into a typed params object, purely at the type level — the technique real typed routers use so a router's \`params\` object is fully typed with zero manual annotation.

## Your task

Write \`ExtractRouteParams<T extends string>\`, extracting every \`:paramName\` segment from a route pattern into an object type with those names as keys (each typed \`string\`). A pattern with no \`:param\` segments at all extracts to an empty object, \`{}\`.

\`\`\`ts
type Result = ExtractRouteParams<'/users/:id/posts/:postId'>
// { id: string; postId: string }

type NoParams = ExtractRouteParams<'/about'>
// {}
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type ExtractRouteParams<T extends string> = unknown;`,
    solutionCode: `type ExtractRouteParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
    : T extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};`,
    testCases: [
      { input: "ExtractRouteParams<'/users/:id/posts/:postId'>", expected: "{ id: string; postId: string }", label: "Extracts every :param segment, however many there are" },
      { input: "ExtractRouteParams<'/about'>", expected: "{}", label: "A route with no params produces an empty object" },
    ],
    hints: [
      "There are genuinely two separate patterns to match: 'a param followed by more path after it' (recurse and merge) versus 'a param at the very end' (the base case, no trailing slash to match against) — a route can end in either shape.",
    ],
    orderIndex: 1329,
  },

  {
    slug: "implement-union-to-intersection",
    companies: ["Microsoft", "Airbnb"],
    category: "typescript",
    title: "Implement UnionToIntersection<T>",
    description: `\`UnionToIntersection\` converts a union type into the intersection of all its members — a genuinely non-obvious trick that exploits function parameter **contravariance**: distributing a union into a union of function parameter positions forces TypeScript to intersect them to find a single type assignable to all of them.

## Your task

Write \`UnionToIntersection<U>\`, converting a union type into the intersection of all its members.

\`\`\`ts
type Result = UnionToIntersection<{ a: string } | { b: number }>
// { a: string } & { b: number }

type Primitives = UnionToIntersection<string | number>
// string & number
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type UnionToIntersection<U> = unknown;`,
    solutionCode: `type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;`,
    testCases: [
      { input: "UnionToIntersection<{ a: string } | { b: number }>", expected: "{ a: string } & { b: number }", label: "Converts an object-type union into the intersection of its members" },
      { input: "UnionToIntersection<string | number>", expected: "string & number", label: "Works for primitive unions too, even ones with no realistic intersection" },
    ],
    hints: [
      "Function parameters are contravariant — a function accepting 'A | B' can be used anywhere a function accepting just 'A' is expected. Distributing U into separate function types and then inferring a single common parameter type is what forces TypeScript to intersect the union's members instead of just re-unioning them.",
    ],
    orderIndex: 1330,
  },

  {
    slug: "implement-sort",
    companies: [],
    category: "typescript",
    title: "Implement Sort<T> (Numeric Tuple Sort)",
    description: `\`Sort\` sorts a tuple of number literal types into ascending order, purely at the type level — real insertion sort, built from the same numeric-comparison technique as \`LargerThan\`.

## Your task

Write \`Sort<T extends number[]>\`, returning \`T\`'s elements sorted into ascending order.

\`\`\`ts
type Result = Sort<[3, 1, 2]>
// [1, 2, 3]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "hard",
    starterCode: `type Sort<T extends number[]> = unknown;`,
    solutionCode: `type Compare<A extends number, B extends number, C extends unknown[] = []> =
  A extends B ? 0 :
  C["length"] extends A ? -1 :
  C["length"] extends B ? 1 :
  Compare<A, B, [...C, unknown]>;

type Insert<T extends number[], N extends number> =
  T extends [infer F extends number, ...infer Rest extends number[]]
    ? Compare<N, F> extends 1
      ? [F, ...Insert<Rest, N>]
      : [N, ...T]
    : [N];

type Sort<T extends number[]> =
  T extends [infer F extends number, ...infer Rest extends number[]]
    ? Insert<Sort<Rest>, F>
    : [];`,
    testCases: [
      { input: "Sort<[3, 1, 2]>", expected: "[1, 2, 3]", label: "Sorts an unordered tuple into ascending order" },
      { input: "Sort<[]>", expected: "[]", label: "Handles an empty tuple as its own base case" },
    ],
    hints: [
      "This is real insertion sort: recursively sort everything after the first element, then Insert that first element into its correct position within the already-sorted remainder — Compare is just a 3-way (-1/0/1) version of the LargerThan technique from the arithmetic stage.",
    ],
    orderIndex: 1331,
  },

  {
    slug: "implement-unique",
    companies: [],
    category: "typescript",
    title: "Implement Unique<T>",
    description: `\`Unique\` removes duplicate values from a tuple, keeping the first occurrence of each and preserving order — it tracks what's already been "seen" in its own accumulator, checked via the same exact-match equality used by \`Includes\`.

## Your task

Write \`Unique<T extends readonly unknown[]>\`, returning \`T\` with duplicate elements removed.

\`\`\`ts
type Result = Unique<[1, 1, 2, 3, 3, 3]>
// [1, 2, 3]
\`\`\`

Graded by real TypeScript type-checking — write a type alias, not JavaScript.`,
    difficulty: "medium",
    starterCode: `type Unique<T extends readonly unknown[]> = unknown;`,
    solutionCode: `type IsIncluded<T extends readonly unknown[], U> = T extends [infer F, ...infer Rest]
  ? Equal<F, U> extends true ? true : IsIncluded<Rest, U>
  : false;

type Unique<T extends readonly unknown[], Seen extends unknown[] = []> =
  T extends [infer F, ...infer Rest]
    ? IsIncluded<Seen, F> extends true
      ? Unique<Rest, Seen>
      : [F, ...Unique<Rest, [...Seen, F]>]
    : [];`,
    testCases: [
      { input: "Unique<[1, 1, 2, 3, 3, 3]>", expected: "[1, 2, 3]", label: "Removes duplicates, keeping the first occurrence of each value" },
      { input: "Unique<[]>", expected: "[]", label: "Handles an empty tuple as its own base case" },
    ],
    hints: [
      "The Seen accumulator needs the exact-match Equal check (the same reasoning as Includes) — a plain extends check would incorrectly treat similar-but-different types as duplicates of each other.",
    ],
    orderIndex: 1332,
  }
];
