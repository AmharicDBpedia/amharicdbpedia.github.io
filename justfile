default:
    @just --list

setup:
    pnpm install --frozen-lockfile

dev:
    pnpm dev

format:
    pnpm format

format-check:
    pnpm format:check

lint:
    pnpm lint

typecheck:
    pnpm typecheck

test:
    pnpm test

test-e2e:
    pnpm test:e2e

build:
    pnpm build

check:
    pnpm check:frontend
