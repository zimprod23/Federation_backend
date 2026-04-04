.PHONY: help dev prod down logs seed build lint test clean

## ── Help ─────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Federation API — available commands"
	@echo ""
	@echo "  make dev          Start MongoDB + API in dev mode (hot reload)"
	@echo "  make prod         Start full stack in production mode"
	@echo "  make down         Stop and remove all containers"
	@echo "  make logs         Tail API logs"
	@echo "  make seed         Run database seeder"
	@echo "  make build        Compile TypeScript"
	@echo "  make lint         Run ESLint"
	@echo "  make test         Run tests"
	@echo "  make clean        Remove dist/ and node_modules/"
	@echo ""

## ── Docker ───────────────────────────────────────────────────────────────────

# Start only MongoDB + mongo-express, run API locally with hot reload
dev:
	docker compose up mongo mongo-express -d
	npm run dev

# Start full stack (API in container)
prod:
	docker compose up --build -d

down:
	docker compose down

# Stop and wipe volumes (destructive — deletes all DB data)
reset:
	docker compose down -v

logs:
	docker compose logs -f api

logs-mongo:
	docker compose logs -f mongo

## ── App ──────────────────────────────────────────────────────────────────────

build:
	npm run build

lint:
	npm run lint

lint-fix:
	npm run lint:fix

test:
	npm run test

test-cov:
	npm run test:cov

seed:
	npm run seed

## ── Utilities ─────────────────────────────────────────────────────────────────

clean:
	rm -rf dist node_modules

install:
	npm install