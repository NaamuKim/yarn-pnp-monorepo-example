# Yarn PnP Monorepo Example

> Yarn Berry (PnP) 기반의 프론트엔드 프레임워크 모노레포 예제
> A monorepo example using Yarn Berry (PnP) with 10 frontend frameworks

---

## 개요 / Overview

이 프로젝트는 Yarn 4 (Berry)의 **PnP (Plug'n'Play)** 모드를 사용한 모노레포 예제입니다.
3개의 공유 패키지와 10개의 프론트엔드 앱으로 구성되어 있습니다.

This project is a monorepo example using Yarn 4 (Berry) in **PnP (Plug'n'Play)** mode.
It consists of 3 shared packages and 10 frontend applications.

---

## 프로젝트 구조 / Project Structure

```
yarn-pnp-monorepo-example/
├── package.json              # 루트 워크스페이스 설정
├── .yarnrc.yml               # Yarn PnP 설정
├── .gitignore
│
├── packages/                 # 공유 패키지
│   ├── ui/                   # @mono/ui — 공통 UI 상수 및 헬퍼
│   ├── utils/                # @mono/utils — 공통 유틸리티 함수
│   └── api-client/           # @mono/api-client — 공통 API 클라이언트 (Mock)
│
└── apps/                     # 프론트엔드 앱 (10개)
    ├── react-app/            # React 18 + Vite          → :3001
    ├── vue-app/              # Vue 3 + Vite             → :3002
    ├── angular-app/          # Angular 18               → :3003
    ├── nextjs-app/           # Next.js 14 (App Router)  → :3004
    ├── nuxt-app/             # Nuxt 3                   → :3005
    ├── svelte-app/           # SvelteKit                → :3006
    ├── solid-app/            # Solid.js + Vite          → :3007
    ├── remix-app/            # Remix v2                 → :3008
    ├── astro-app/            # Astro                    → :3009
    └── qwik-app/             # Qwik                    → :3010
```

---

## 공유 패키지 / Shared Packages

| 패키지 | 이름 | 설명 |
|--------|------|------|
| `packages/ui` | `@mono/ui` | 공통 색상, 간격, UI 헬퍼 / Shared colors, spacing, UI helpers |
| `packages/utils` | `@mono/utils` | 날짜·통화 포맷, debounce, classNames 등 / Date/currency formatting, debounce, classNames |
| `packages/api-client` | `@mono/api-client` | Mock API 클라이언트 (Products, Users) / Mock API client for Products and Users |

---

## 앱 목록 / Application List

| 앱 | 패키지명 | 프레임워크 | 포트 | 렌더링 방식 |
|----|----------|-----------|------|------------|
| `apps/react-app` | `@mono/react-app` | React 18 + Vite | 3001 | CSR |
| `apps/vue-app` | `@mono/vue-app` | Vue 3 + Vite | 3002 | CSR |
| `apps/angular-app` | `@mono/angular-app` | Angular 18 | 3003 | CSR |
| `apps/nextjs-app` | `@mono/nextjs-app` | Next.js 14 (App Router) | 3004 | SSR |
| `apps/nuxt-app` | `@mono/nuxt-app` | Nuxt 3 | 3005 | SSR |
| `apps/svelte-app` | `@mono/svelte-app` | SvelteKit | 3006 | SSR |
| `apps/solid-app` | `@mono/solid-app` | Solid.js + Vite | 3007 | CSR |
| `apps/remix-app` | `@mono/remix-app` | Remix v2 | 3008 | SSR |
| `apps/astro-app` | `@mono/astro-app` | Astro (Islands) | 3009 | SSR |
| `apps/qwik-app` | `@mono/qwik-app` | Qwik | 3010 | SSR (Resumable) |

---

## 시작하기 / Getting Started

### 사전 요구 사항 / Prerequisites

- Node.js 20+
- Yarn 4.6.0+ (`corepack enable` 후 자동 설치됨)

### 설치 / Installation

```bash
# Corepack 활성화 (최초 1회)
corepack enable

# 의존성 설치
yarn install
```

> Yarn PnP 모드이므로 `node_modules` 디렉토리가 생성되지 않습니다.
> Since Yarn PnP mode is used, no `node_modules` directory is created.

---

## 실행 방법 / Running Apps

### 전체 앱 동시 실행 / Run All Apps in Parallel

```bash
yarn dev
```

### 개별 앱 실행 / Run Individual Apps

```bash
# React App (http://localhost:3001)
yarn workspace @mono/react-app dev

# Vue App (http://localhost:3002)
yarn workspace @mono/vue-app dev

# Angular App (http://localhost:3003)
yarn workspace @mono/angular-app dev

# Next.js App (http://localhost:3004)
yarn workspace @mono/nextjs-app dev

# Nuxt App (http://localhost:3005)
yarn workspace @mono/nuxt-app dev

# SvelteKit App (http://localhost:3006)
yarn workspace @mono/svelte-app dev

# Solid.js App (http://localhost:3007)
yarn workspace @mono/solid-app dev

# Remix App (http://localhost:3008)
yarn workspace @mono/remix-app dev

# Astro App (http://localhost:3009)
yarn workspace @mono/astro-app dev

# Qwik App (http://localhost:3010)
yarn workspace @mono/qwik-app dev
```

---

## 빌드 / Build

```bash
# 전체 빌드 (위상 정렬 순서로 / topological order)
yarn build

# 개별 빌드
yarn workspace @mono/react-app build
```

---

## 타입 체크 / Type Check

```bash
# 전체 타입 체크
yarn typecheck

# 개별 타입 체크
yarn workspace @mono/utils typecheck
```

---

## 클린 / Clean

```bash
# 전체 빌드 아티팩트 제거
yarn clean
```

---

## Yarn PnP 주요 특징 / Key PnP Features

| 특징 | 설명 |
|------|------|
| **Zero-installs** 지원 | `.yarn/cache`를 git에 커밋하면 `yarn install` 없이 바로 사용 가능 |
| **빠른 설치** | `node_modules` 생성 없이 zip 파일로 패키지 관리 |
| **엄격한 의존성** | 선언되지 않은 패키지 접근 차단 (유령 의존성 방지) |
| **글로벌 캐시** | `enableGlobalCache: true`로 머신 전체 캐시 공유 |
| **워크스페이스 프로토콜** | `workspace:*`로 로컬 패키지 참조 |

---

## 기술 스택 / Tech Stack

- **패키지 매니저**: Yarn 4.6.0 (Berry, PnP mode)
- **언어**: TypeScript 5.x
- **공통 빌드**: tsc (TypeScript Compiler)
- **Vite 기반 앱**: React, Vue, Solid.js, Remix, SvelteKit
- **메타 프레임워크**: Next.js (React), Nuxt (Vue), SvelteKit (Svelte), Remix (React), Astro, Qwik

---

## 라이선스 / License

MIT
