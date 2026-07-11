PIDS_DIR := .pids
LOGS_DIR := .logs

API_PORT ?= 8787
WEB_PORT ?= 3000
APP_PORT ?= 8081

.PHONY: help install build build-api build-web build-app clean up down fresh migrate-local seed-demo provision-cqrs build-cqrs-wasm seed-cqrs-local test-e2e deploy-api deploy-web deploy-cqrs deploy-cqrs-prd seed-cqrs-adhoc seed-cqrs-prd up-prd design-sync

# `make` alone shows this menu; run `make up` to get to localhost (see README).
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	bun install

migrate-local: ## Run local DB migrations for the API
	cd packages/api && bun run migrate:local

seed-demo: ## Seed demo user credentials into the local API database
	cd packages/api && bun run seed:demo

provision-cqrs: ## Provision a local Neon database for CQRS (via neon-new)
	cd packages/atomik-cqrs && make db-provision

build-cqrs-wasm: ## Build the CQRS edge worker WASM binary
	cd packages/atomik-cqrs && make wasm

seed-cqrs-local: ## Seed demo events into the local CQRS database
	cd packages/atomik-cqrs && make seed-adhoc

build: build-api build-web build-app ## Build api, web, and app

build-api: ## Build the api package
	cd packages/api && bun run build

build-web: ## Build the web package
	cd packages/web && bun run build

build-app: ## Build the app package
	cd packages/app && bun run build

clean: ## Remove build output for api, web, and app
	rm -rf packages/api/dist packages/web/.next packages/web/.open-next packages/app/dist

# Frees the dev ports before a run, so a crashed or manually-killed previous
# session (stale beyond what the .pids files know about) can't block `up`
# or leave `web` pointed at a port `api` isn't actually listening on.
fresh: ## Free dev ports left over from a stale run
	@for port in $(API_PORT) $(WEB_PORT) $(APP_PORT); do \
		pid=$$(lsof -ti tcp:$$port -sTCP:LISTEN); \
		if [ -n "$$pid" ]; then \
			kill $$pid 2>/dev/null && echo "freed port $$port (killed pid $$pid)"; \
		fi; \
	done
	@rm -f $(PIDS_DIR)/*.pid

up: install fresh migrate-local seed-demo provision-cqrs build-cqrs-wasm ## Start api, web, app, and cqrs locally
	@mkdir -p $(PIDS_DIR) $(LOGS_DIR)
	@echo "API_URL=http://localhost:$(API_PORT)" > packages/web/.env.local
	@bash -c 'cd packages/atomik-cqrs && CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="$$(grep ATOMIK_DATABASE_URL .env.local | cut -d= -f2-)" exec bunx wrangler dev --config edge/wrangler.jsonc --port 8788' > $(LOGS_DIR)/cqrs.log 2>&1 & echo $$! > $(PIDS_DIR)/cqrs.pid
	@sleep 4
	@bash -c 'cd packages/api && exec bun run dev --port $(API_PORT)' > $(LOGS_DIR)/api.log 2>&1 & echo $$! > $(PIDS_DIR)/api.pid
	@bash -c 'cd packages/web && exec bun run dev --port $(WEB_PORT)' > $(LOGS_DIR)/web.log 2>&1 & echo $$! > $(PIDS_DIR)/web.pid
	@bash -c 'cd packages/app && exec bun run start --port $(APP_PORT)' > $(LOGS_DIR)/app.log 2>&1 & echo $$! > $(PIDS_DIR)/app.pid
	@sleep 1
	@make seed-cqrs-local
	@echo ""
	@echo "Services running:"
	@echo "  cqrs -> edge worker (atomik-cqrs) (log: $(LOGS_DIR)/cqrs.log)"
	@echo "  api  -> http://localhost:$(API_PORT)  (log: $(LOGS_DIR)/api.log)"
	@echo "  web  -> http://localhost:$(WEB_PORT)  (log: $(LOGS_DIR)/web.log)"
	@echo "  app  -> Metro on :$(APP_PORT)         (log: $(LOGS_DIR)/app.log)"
	@echo ""
	@echo "Demo Credentials:"
	@echo "  📧 Email:    demo@example.com"
	@echo "  🔐 Password: demo1234"

down: ## Stop the locally running api, web, and app processes
	@for f in $(PIDS_DIR)/*.pid; do \
		[ -f "$$f" ] || continue; \
		pid=$$(cat "$$f"); \
		if kill -0 "$$pid" 2>/dev/null; then kill "$$pid" && echo "stopped $$(basename $$f .pid) (pid $$pid)"; fi; \
		rm -f "$$f"; \
	done

test-e2e: ## Run the web package's e2e tests
	cd packages/web && bun run test:e2e

deploy-api: ## Apply remote D1 migrations and deploy the api
	cd packages/api && wrangler d1 migrations apply betty-api --remote && wrangler deploy

deploy-web: ## Deploy the web package
	cd packages/web && bun run deploy

deploy-cqrs: ## Deploy the atomik-cqrs event-store Worker to adhoc (fresh neon-new branch each time)
	cd packages/atomik-cqrs && make edge-deploy

deploy-cqrs-prd: ## Deploy the atomik-cqrs event-store Worker to production (Hyperdrive -> NEON_DB_KEY)
	cd packages/atomik-cqrs && make edge-deploy-prd

seed-cqrs-adhoc: ## Apply illustrative seed events (packages/schema-etl) to the adhoc event-store database
	cd packages/atomik-cqrs && make seed-adhoc

seed-cqrs-prd: ## Apply illustrative seed events (packages/schema-etl) to the production event-store database
	cd packages/atomik-cqrs && make seed-prd

# deploy-cqrs-prd is deliberately NOT a prerequisite here yet — folding it in changes what a
# plain `make up-prd` does today. Run it standalone until that's an explicit decision.
up-prd: deploy-api deploy-web ## Deploy api and web to production

design-sync: ## Rebuild the ds-bundle diff against the Claude Design project (push still requires Claude Code)
	node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules packages/web/node_modules --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
