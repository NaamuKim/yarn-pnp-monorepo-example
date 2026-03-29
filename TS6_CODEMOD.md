# TypeScript 5 → 6 Breaking Changes & Codemod 분석

> **작성 목적:** `@andrewbranch/ts5to6` 코드모드가 다루지 않는 Breaking Change를 직접 구현하면서
> 각 BC의 원인, 자동화 가능성, 그리고 현재 코드모드 접근법의 한계를 기록한다.

---

## 목차

1. [Breaking Change 목록](#1-breaking-change-목록)
2. [tsconfig 레벨 BC (자동화 가능 ✅)](#2-tsconfig-레벨-bc)
3. [소스 파일 레벨 BC (부분 자동화 ⚠️)](#3-소스-파일-레벨-bc)
4. [자동화 불가 / 사람 판단 필요 BC](#4-자동화-불가--사람-판단-필요-bc)
5. [코드모드 한계의 근본 원인](#5-코드모드-한계의-근본-원인)
6. [해결 방향](#6-해결-방향)

---

## 1. Breaking Change 목록

| # | 카테고리 | TypeScript PR | 에러 코드 | 코드모드 | 샘플 |
|---|----------|--------------|-----------|---------|------|
| 1 | tsconfig | [#62338](https://github.com/microsoft/TypeScript/pull/62338) | TS6046 | ✅ 100% | [01-module-resolution-node.ts](apps/ts6-holes-app/src/holes/01-module-resolution-node.ts) |
| 2 | tsconfig | [#62567](https://github.com/microsoft/TypeScript/pull/62567) | TS5107 | ✅ 100% | [02-esmodule-interop.ts](apps/ts6-holes-app/src/holes/02-esmodule-interop.ts) |
| 3 | tsconfig | [#62567](https://github.com/microsoft/TypeScript/pull/62567) | TS5107 | ✅ 100% | [02-esmodule-interop.ts](apps/ts6-holes-app/src/holes/02-esmodule-interop.ts) |
| 4 | source | [#62876](https://github.com/microsoft/TypeScript/pull/62876) | TS1540 | ⚠️ ~90% | [03-module-keyword.ts](apps/ts6-holes-app/src/holes/03-module-keyword.ts) |
| 5 | source | [#63077](https://github.com/microsoft/TypeScript/pull/63077) | TS2836 | ⚠️ ~99% | [04-import-assert.ts](apps/ts6-holes-app/src/holes/04-import-assert.ts) |
| 6 | tsconfig | [#58941](https://github.com/microsoft/TypeScript/pull/58941) | TS2882 | ✅ 100% | [main.tsx](apps/ts6-holes-app/src/main.tsx) |
| 7 | tsconfig | [#63054](https://github.com/microsoft/TypeScript/pull/63054) | TS2304 | 🔶 휴리스틱 | [05-types-default-empty.ts](apps/ts6-holes-app/src/holes/05-types-default-empty.ts) |
| 8 | tsconfig | [#62669](https://github.com/microsoft/TypeScript/pull/62669) | TS5101 | ⚠️ 감지만 | [06-out-file-removed.ts](apps/ts6-holes-app/src/holes/06-out-file-removed.ts) |
| 9 | tsconfig | [#63089](https://github.com/microsoft/TypeScript/pull/63089) | TS7006 | ✅ 100% | [07-strict-default-true.ts](apps/ts6-holes-app/src/holes/07-strict-default-true.ts) |
| 10 | source | [#61011](https://github.com/microsoft/TypeScript/pull/61011) | TS1294 | ⚠️ ~100% | [08-const-enum-erasable.ts](apps/ts6-holes-app/src/holes/08-const-enum-erasable.ts) |
| 11 | source | [#61011](https://github.com/microsoft/TypeScript/pull/61011) | TS1294 | ⚠️ ~75% | [09-namespace-erasable.ts](apps/ts6-holes-app/src/holes/09-namespace-erasable.ts) |

---

## 2. tsconfig 레벨 BC

tsconfig 옵션 변경은 **JSON 편집만으로 완전히 자동화**할 수 있다.
구현체: [`packages/ts6-codemod/src/tsconfig-fixes/`](packages/ts6-codemod/src/tsconfig-fixes/)

---

### BC #1 — `moduleResolution: "node"` 제거 ([PR #62338](https://github.com/microsoft/TypeScript/pull/62338))

**왜 발생했나**

`"node"` 알고리즘은 2014년 TypeScript 1.x가 Node.js `require()`를 흉내낸 것으로, 현대 모듈 생태계와 근본적으로 맞지 않는다:

- `package.json`의 `exports` 필드 무시
- 확장자 없는 import 허용 (`./utils` → `.js`/.`ts` 탐색)
- ESM subpath 미지원

`"classic"`은 Node.js도 없던 TypeScript 자체 알고리즘으로 그보다 더 구식이다.
TS6는 이 두 값을 **완전히 제거**했다 (`TS6046`).

**코드모드 구현** — [`fix-module-resolution.ts`](packages/ts6-codemod/src/tsconfig-fixes/fix-module-resolution.ts)

```jsonc
// Before
{ "moduleResolution": "node" }

// After
{ "moduleResolution": "bundler" }
```

**커버리지: ~90%**

에러 자체는 100% 제거된다. 단, 최적 목적지 판단이 프로젝트 의존적이다:

| 프로젝트 종류 | 올바른 값 | 현재 코드모드 |
|-------------|---------|-------------|
| Vite / webpack / Rollup | `"bundler"` | `"bundler"` ✅ |
| Node.js 서버 (ESM) | `"nodenext"` | `"bundler"` ❌ |
| Node.js 서버 (CJS) | `"node16"` | `"bundler"` ❌ |

완전한 100%는 `devDependencies`에서 `vite`/`webpack`/`next` 등 번들러 마커를 탐지해 분기해야 한다.

---

### BC #2, #3 — `esModuleInterop: false` / `allowSyntheticDefaultImports: false` 금지 ([PR #62567](https://github.com/microsoft/TypeScript/pull/62567))

**왜 발생했나**

CJS 모듈을 `import React from 'react'`로 가져오려면 interop이 필요했다.
`esModuleInterop: false`는 이를 비활성화해 `import * as React from 'react'` 형태를 강제했다.
TS6는 interop을 **항상 켜는 것으로 확정**하고 `false` 설정을 `TS5107` 에러로 막았다.
이유: 끌 수 있는 옵션은 "끈 프로젝트에서만 재현되는 버그"를 만들어 생태계 호환성을 해친다.

**코드모드 구현** — [`fix-esmodule-interop.ts`](packages/ts6-codemod/src/tsconfig-fixes/fix-esmodule-interop.ts)

```jsonc
// Before
{
  "esModuleInterop": false,
  "allowSyntheticDefaultImports": false
}

// After (두 키 모두 제거 — 생략 = true)
{}
```

**커버리지: 100%**

키 삭제 = TS6 기본값(항상 `true`) 적용. 완전 동치 변환이다.
소스 코드의 `import * as X from 'y'` 패턴을 `import X from 'y'`로 단순화하는 것은 에러가 아닌 스타일 개선이므로 별도 transform 범위다.

---

### BC #6 — `noUncheckedSideEffectImports` 기본값 `true` ([PR #58941](https://github.com/microsoft/TypeScript/pull/58941))

**왜 발생했나**

TS 5.6에서 도입된 옵션으로, TS6에서 기본값이 `true`가 됐다.
부수 효과 import (`import './index.css'`)는 타입 정의 없이 런타임에만 의미 있는 구문인데,
TS6는 이를 타입 레벨에서도 검증하기 시작했다 → `TS2882`.

```ts
import './index.css';  // TS2882: Cannot find module or type declarations
```

**해결책 두 가지**

```jsonc
// Option A: tsconfig에서 끄기 (동작 보존, 덜 엄격)
{ "noUncheckedSideEffectImports": false }

// Option B: vite-env.d.ts 추가 (권장, 실제 타입 선언 제공)
/// <reference types="vite/client" />
```

이 레포는 [Option B로 수정](apps/react-app/src/vite-env.d.ts)되어 있다.
코드모드로는 `src/` 안의 side-effect import를 스캔하고 `devDependencies`에서 번들러를 탐지해 적절한 `d.ts` reference를 생성하는 방식으로 100% 자동화 가능하다.

---

### BC #7 — `types` 기본값 `[]` ([PR #63054](https://github.com/microsoft/TypeScript/pull/63054))

**왜 발생했나**

TS5까지는 `types`를 생략하면 `node_modules/@types/` 아래 모든 패키지가 자동 로드됐다.
TS6는 기본값을 `[]`로 바꿔 명시적 선언을 요구한다.
결과: `@types/node`가 없으면 `process`, `__dirname`, `Buffer` 등이 `TS2304` 에러.

**코드모드 전략 (휴리스틱 필요)**

완전 자동화는 두 단계가 필요하다:

1. `package.json`의 `devDependencies`에서 `@types/*` 목록 추출
2. `src/**/*.ts`를 스캔해 실제로 사용 중인 전역(`process`, `describe`, `expect` 등)과 매핑

```jsonc
// Before (types 없음)
{}

// After
{ "types": ["node", "jest"] }
```

이 레포의 [샘플](apps/ts6-holes-app/src/holes/05-types-default-empty.ts)은 `"types"` 생략으로 `process`/`__dirname`이 `TS2304`가 되는 것을 보여준다.

---

### BC #8 — `outFile` + `module: amd/umd/system` 제거 ([PR #62669](https://github.com/microsoft/TypeScript/pull/62669))

**왜 발생했나**

RequireJS/SystemJS 시대의 유산. 번들러가 이 역할을 완전히 대체했고 유지 비용만 드는 상태였다.
TS6는 `outFile`, `module: "amd"/"umd"/"system"/"none"`, `moduleResolution: "classic"` 을 모두 제거했다 (`TS5101`).

**코드모드 전략**

이건 자동 수정이 아닌 **감지 + 에러 출력**이 맞다.
어떤 번들러로 마이그레이션할지는 사람이 결정해야 하기 때문이다.

[샘플](apps/ts6-holes-app/src/holes/06-out-file-removed.ts) 참고.

---

### BC #9 — `strict` 기본값 `true` ([PR #63089](https://github.com/microsoft/TypeScript/pull/63089))

**왜 발생했나**

10년간 기본값이 `false`였기 때문에 `strict`를 명시하지 않은 수많은 프로젝트가 느슨한 설정으로 작성됐다.
TS6는 "새 프로젝트의 기본값은 엄격해야 한다"는 판단으로 기본값을 뒤집었다.
업그레이드 즉시 `TS7006`(implicit any), `TS2531`(possibly null) 등이 대거 등장한다.

**코드모드 구현** — [`fix-strict.ts`](packages/ts6-codemod/src/tsconfig-fixes/fix-strict.ts)

```jsonc
// Before (strict 없음 → TS6에서 갑자기 true)
{ "target": "ES2020" }

// After (TS5 동작 그대로 보존)
{ "target": "ES2020", "strict": false }
```

**커버리지: 100%**

`strict: false`를 명시하면 TS5 동작과 완전히 동일하다.
strict 패밀리 옵션(`strictNullChecks`, `noImplicitAny`, ...)을 모두 끄기 때문이다.
이후 점진적으로 strict를 켜는 것은 개발자 몫.

---

## 3. 소스 파일 레벨 BC

소스 파일은 텍스트/AST 변환이 필요하다.
구현체: [`packages/ts6-codemod/src/transforms/`](packages/ts6-codemod/src/transforms/)

---

### BC #4 — `module` 키워드 → `namespace` ([PR #62876](https://github.com/microsoft/TypeScript/pull/62876))

**왜 발생했나**

TypeScript 1.0(2014)에서 namespace를 "internal module"이라 불렀고 `module Foo {}` 문법을 사용했다.
TypeScript 1.5(2015)에서 ES6 `module` 키워드와의 혼동을 막기 위해 `namespace` 키워드가 도입됐다.
9년간 하위 호환으로 유지되다가 TS6에서 `TS1540` 에러로 막혔다.

**중요한 구분**

```ts
module Foo {}            // ← TS1540 (이것만 바꿔야 함)
declare module 'foo' {}  // ← 여전히 유효 (ambient module declaration, 다른 문법)
```

**코드모드 구현** — [`module-keyword.ts`](packages/ts6-codemod/src/transforms/module-keyword.ts)

```ts
// regex
/\bmodule\s+([A-Za-z_$][A-Za-z0-9_$]*)/g → 'namespace $1'
```

`module` 뒤에 식별자를 요구하므로 `module 'foo'`는 걸리지 않는다.

**커버리지: ~90%**

Regex의 한계: **주석과 문자열 내부도 치환한다.**

```ts
// module Foo {}  ← 주석도 namespace로 바뀜 (false positive)
const doc = `module Config { ... }`;  // ← 문자열도 바뀜 (false positive)
```

완전한 100%는 jscodeshift AST로만 가능하다:

```ts
root.find(j.TSModuleDeclaration, { id: { type: 'Identifier' } })
  .filter(p => p.node.kind === 'module')
  .forEach(p => { p.node.kind = 'namespace'; });
```

AST는 주석/문자열을 노드로 파싱하지 않으므로 false positive가 없다.

---

### BC #5 — `import assert {}` → `import with {}` ([PR #63077](https://github.com/microsoft/TypeScript/pull/63077))

**왜 발생했나**

TC39 Stage 3 제안이었던 Import Assertions(`assert`)가 최종 스펙에서 Import Attributes(`with`)로 키워드가 바뀌었다.
TypeScript는 5.3에서 deprecated, TS6에서 `TS2836` 에러로 막았다.

```ts
// Before
import data from './data.json' assert { type: 'json' };

// After
import data from './data.json' with { type: 'json' };
```

**코드모드 구현** — [`import-assert.ts`](packages/ts6-codemod/src/transforms/import-assert.ts)

```ts
/(from\s+['"][^'"]*['"]\s*)\bassert\s*(\{)/g → '$1with $2'
```

`from '...'` 선행을 요구하므로 `import assert from 'node:assert'`나 일반 `assert()` 호출은 영향 없다.

**커버리지: ~99%**

`\s`와 `[^'"]*` 모두 줄바꿈을 포함하므로 멀티라인 import도 처리된다.
실질적으로 `import ... assert {}` 구문이 등장하는 모든 경우를 커버한다.

---

### BC #10 (part 1) — `const enum` + `erasableSyntaxOnly` ([PR #61011](https://github.com/microsoft/TypeScript/pull/61011))

**왜 발생했나**

`const enum`은 TypeScript만의 기능으로 컴파일 시 enum 값을 **사용 지점에 인라인**한다:

```ts
const enum Dir { Up = 'UP' }
const x = Dir.Up;
// tsc 출력: const x = 'UP';  ← 런타임에 Dir 객체 없음
```

문제: esbuild, SWC, Vite의 TS 변환, Node.js `--experimental-strip-types`는
**타입만 지우는(erase-only) 방식**으로 동작한다.
다른 파일에 선언된 `const enum` 값을 읽지 않고 타입만 지우면 `Dir.Up`을 `'UP'`으로 인라인할 수 없다
→ 런타임에 `Dir is not defined`.

TS 5.8의 `--erasableSyntaxOnly`는 이를 컴파일 시점에 탐지하고, TS6 생태계의 방향성이다.

**코드모드 구현** — [`const-enum.ts`](packages/ts6-codemod/src/transforms/const-enum.ts)

```ts
/\bconst\s+(enum\b)/g → '$1'
```

```ts
// Before
export const enum Direction { Up = 'UP', Down = 'DOWN' }

// After
export enum Direction { Up = 'UP', Down = 'DOWN' }
```

**커버리지: 100%**

`const` 제거 = 의미론적으로 완전히 동치다.
런타임 객체가 생성되는 미미한 오버헤드가 추가될 뿐 기능적 차이는 없다.
`const` 뒤에 단어 경계 `\b`가 붙은 `enum`만 매칭하므로 `const enumerable` 같은 변수명은 건드리지 않는다.

---

### BC #10 (part 2) — 값 포함 `namespace` + `erasableSyntaxOnly` ([PR #61011](https://github.com/microsoft/TypeScript/pull/61011))

**왜 발생했나**

`const enum`과 동일한 이유. 값을 포함한 namespace는 tsc가 IIFE 패턴으로 컴파일한다:

```ts
// 입력
namespace Api { export function get(url: string) { return fetch(url); } }

// tsc 출력
var Api;
(function (Api) {
  function get(url) { return fetch(url); }
  Api.get = get;
})(Api || (Api = {}));
```

erase-only 도구는 이 코드를 생성할 수 없고 그냥 타입만 지운다 → `Api is not defined`.

**핵심 판별 기준**

```ts
// 값 포함 namespace → TS1294, 변환 필요
export namespace Api {
  export function get() { ... }       // ← 런타임 코드
}

// 타입만 있는 namespace → erasable, 변환 불필요 ✅
export namespace ApiTypes {
  export interface Response<T> { ... }  // ← 타입만 (컴파일 결과물 없음)
  export type Method = 'GET' | 'POST';
}
```

**코드모드 구현** — [`namespace-to-object.ts`](packages/ts6-codemod/src/transforms/namespace-to-object.ts)

jscodeshift AST를 사용해 멤버 타입을 판별한다.

```ts
// Before
export namespace Api {
  export function get(url: string) { return fetch(url).then(r => r.json()); }
  export function post(url: string, body: unknown) { return fetch(url, { method: 'POST' }); }
}

// After
export const Api = {
  get(url: string) { return fetch(url).then(r => r.json()); },
  post(url: string, body: unknown) { return fetch(url, { method: 'POST' }); },
};
```

**커버리지: ~75%**

현재 미처리 케이스:

```ts
// 1. class 멤버 (현재 _unsupported placeholder)
namespace Foo { export class Bar {} }

// 2. 중첩 namespace
namespace Outer { export namespace Inner { export function f() {} } }

// 3. declaration merging (같은 이름 여러 번 선언)
namespace Foo { export function a() {} }
namespace Foo { export function b() {} }  // 병합됨 → 두 번째를 놓침

// 4. 타입과 값 동시 병합 (가장 복잡)
namespace Vec2 { export function add() {} }
type Vec2 = { x: number; y: number };  // 같은 이름 타입 — const로 바꾸면 충돌
```

---

## 4. 자동화 불가 / 사람 판단 필요 BC

### BC #8 — `outFile` / AMD/UMD/System 제거

코드모드가 감지는 할 수 있지만 자동 수정은 안 된다.
"어떤 번들러로 마이그레이션할 것인가"는 프로젝트 아키텍처 결정이기 때문이다.

올바른 코드모드 동작: **에러 출력 + 마이그레이션 가이드 링크**.

---

## 5. 코드모드 한계의 근본 원인

### 핵심: 코드모드는 타입 정보 없이 텍스트만 본다

jscodeshift와 regex 기반 코드모드는 소스 파일을 **문자열 또는 구문 트리(syntax tree)** 로만 본다.
TypeScript의 타입 시스템이 갖고 있는 **의미론적 정보(semantic information)** 에는 접근할 수 없다.

```
소스 텍스트 → [jscodeshift/AST] → 변환
                  ↑
           타입 정보 없음
           다른 파일 정보 없음
           심볼 참조 추적 없음
```

구체적으로 문제가 되는 시나리오:

**시나리오 A: namespace가 다른 파일에서 타입으로도 사용됨**

```ts
// file-a.ts
export namespace Vec2 { export function add(a: Vec2, b: Vec2): Vec2 { ... } }
export type Vec2 = { x: number; y: number };

// file-b.ts
import { Vec2 } from './file-a';
const v: Vec2 = Vec2.add({ x: 1, y: 0 }, { x: 0, y: 1 });
//      ^^^             ^^^
//      타입으로 사용    값으로 사용
```

`Vec2`를 `const`로 바꾸면 타입 `Vec2`가 사라진다.
이를 알려면 **프로젝트 전체의 심볼 참조 그래프**가 필요하다.

**시나리오 B: `const enum`이 `.d.ts`를 통해 외부에서 참조됨**

```ts
// lib.d.ts (외부 라이브러리)
export const enum Status { OK = 200 }

// my-app.ts
import { Status } from 'lib';
if (res.status === Status.OK) { ... }
// erase-only 도구: Status.OK를 200으로 인라인 불가
```

우리 소스의 `const enum`을 `enum`으로 바꾸는 것은 100% 가능하지만,
외부 라이브러리의 `const enum`을 사용하는 경우는 코드모드로 해결 불가 — 라이브러리 측이 고쳐야 한다.

**시나리오 C: module 키워드가 문자열/주석 내부에 등장**

```ts
// 문서 주석
/**
 * @example
 * module Config { export const timeout = 3000; }
 */
```

Regex는 코드와 주석/문자열을 구분하지 못한다.
jscodeshift AST는 파싱된 노드만 보므로 주석은 건드리지 않는다.
하지만 AST도 **타입 정보**는 없다는 한계는 같다.

---

## 6. 해결 방향

### Level 1: jscodeshift AST (현재 구현)

```
소스 텍스트 → babel/typescript AST → 노드 순회 및 치환 → 출력
```

- ✅ 주석/문자열 false positive 없음 (regex보다 정확)
- ✅ 구조적 변환 가능 (namespace → const object)
- ❌ 타입 정보 없음
- ❌ 다른 파일 참조 추적 불가
- 적합한 BC: #4(module keyword), #5(import assert), #10(const enum/namespace 단순 케이스)

---

### Level 2: `ts-morph` (TypeScript Language Service 래핑)

```
TypeScript Program
  ├── 타입 체커 (TypeChecker)
  ├── 심볼 참조 그래프
  ├── 선언 추적 (findReferences)
  └── 타입 정보 (getType, getSymbol)
```

[ts-morph](https://github.com/dsherret/ts-morph)는 TypeScript Language Service를 편리하게 쓸 수 있는 래퍼다.

```ts
import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

// namespace의 모든 참조를 찾아 타입/값 구분
const sourceFile = project.getSourceFileOrThrow('src/index.ts');
const ns = sourceFile.getNamespace('Vec2')!;
const refs = ns.findReferencesAsNodes();
const usedAsType = refs.some(r => r.getParentIfKind(SyntaxKind.TypeReference));
```

- ✅ 타입 정보 완전 접근
- ✅ 파일 간 참조 추적
- ✅ declaration merging 탐지 가능
- ❌ tsc 전체를 실행해야 하므로 느림 (대규모 프로젝트에서 수 분)
- 적합한 BC: namespace 복잡 케이스, declaration merging

---

### Level 3: TypeScript Transform Plugin

TypeScript 컴파일러 자체의 transform pipeline에 끼워 넣는 방식.

```ts
import ts from 'typescript';

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isModuleDeclaration(node) && /* 조건 */) {
        return ts.factory.createVariableStatement(/* ... */);
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
};
```

- ✅ TypeScript 내부 타입 정보 완전 접근
- ✅ `checker.getTypeAtLocation()` 등 모든 API 사용 가능
- ❌ API가 unstable (TypeScript 버전마다 변경)
- ❌ 코드 작성이 복잡

---

### 정리: BC별 권장 구현 방법

| BC | 현재 구현 | 100%를 위한 방법 |
|----|----------|----------------|
| #1 moduleResolution | JSON 편집 | devDependencies 분석 추가 |
| #2/#3 esModuleInterop | JSON 편집 | **이미 100%** |
| #6 noUncheckedSideEffect | — | src/ 스캔 + d.ts 생성 |
| #7 types 기본값 | — | devDependencies × 소스 전역 매핑 |
| #9 strict | JSON 편집 | **이미 100%** |
| #4 module keyword | regex | jscodeshift AST (주석 false positive 제거) |
| #5 import assert | regex | **이미 ~100%** |
| #10 const enum | regex | **이미 100%** |
| #10 namespace (단순) | jscodeshift AST | **이미 ~100%** |
| #10 namespace (복잡) | 미처리 | ts-morph (참조 추적 필요) |
| #8 outFile | 미처리 | 감지 + 에러 출력 (자동 수정 불가) |

---

## 관련 파일

- **BC 샘플 앱**: [`apps/ts6-holes-app/`](apps/ts6-holes-app/)
- **코드모드 패키지**: [`packages/ts6-codemod/`](packages/ts6-codemod/)
- **테스트**: [`packages/ts6-codemod/src/__tests__/`](packages/ts6-codemod/src/__tests__/) (41 tests)
- **`@andrewbranch/ts5to6` 원본**: https://github.com/andrewbranch/ts5to6
