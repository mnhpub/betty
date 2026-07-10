PIDS_DIR := .pids
LOGS_DIR := .logs

API_PORT ?= 8787
WEB_PORT ?= 3000
APP_PORT ?= 8081

.PHONY: install build build-api build-web build-app clean up down fresh test-e2e deploy-api deploy-web up-prd help schema schema-infer schema-sql schema-types schema-migrations schema-validate schema-clean schema-status

install:
	bun install

build: build-api build-web build-app

build-api:
	cd packages/api && bun run build

build-web:
	cd packages/web && bun run build

build-app:
	cd packages/app && bun run build

clean:
	rm -rf packages/api/dist packages/web/.next packages/app/dist

# Frees the dev ports before a run, so a crashed or manually-killed previous
# session (stale beyond what the .pids files know about) can't block `up`
# or leave `web` pointed at a port `api` isn't actually listening on.
fresh:
	@for port in $(API_PORT) $(WEB_PORT) $(APP_PORT); do \
		pid=$$(lsof -ti tcp:$$port -sTCP:LISTEN); \
		if [ -n "$$pid" ]; then \
			kill $$pid 2>/dev/null && echo "freed port $$port (killed pid $$pid)"; \
		fi; \
	done
	@rm -f $(PIDS_DIR)/*.pid

up: fresh
	@mkdir -p $(PIDS_DIR) $(LOGS_DIR)
	@echo "API_URL=http://localhost:$(API_PORT)" > packages/web/.env.local
	@bash -c 'cd packages/api && exec bun run dev --port $(API_PORT)' > $(LOGS_DIR)/api.log 2>&1 & echo $$! > $(PIDS_DIR)/api.pid
	@bash -c 'cd packages/web && exec bun run dev --port $(WEB_PORT)' > $(LOGS_DIR)/web.log 2>&1 & echo $$! > $(PIDS_DIR)/web.pid
	@bash -c 'cd packages/app && exec bun run start --port $(APP_PORT)' > $(LOGS_DIR)/app.log 2>&1 & echo $$! > $(PIDS_DIR)/app.pid
	@sleep 1
	@echo "api  -> http://localhost:$(API_PORT)  (log: $(LOGS_DIR)/api.log)"
	@echo "web  -> http://localhost:$(WEB_PORT)  (log: $(LOGS_DIR)/web.log)"
	@echo "app  -> Metro on :$(APP_PORT)         (log: $(LOGS_DIR)/app.log)"

down:
	@for f in $(PIDS_DIR)/*.pid; do \
		[ -f "$$f" ] || continue; \
		pid=$$(cat "$$f"); \
		if kill -0 "$$pid" 2>/dev/null; then kill "$$pid" && echo "stopped $$(basename $$f .pid) (pid $$pid)"; fi; \
		rm -f "$$f"; \
	done

test-e2e:
	cd packages/web && bun run test:e2e

deploy-api:
	cd packages/api && wrangler d1 migrations apply betty-api --remote && wrangler deploy

deploy-web:
	cd packages/web && bun run deploy

up-prd: deploy-api deploy-web
	@echo "Production deploy complete (api + web)."

# Schema ETL Pipeline
help:
	@echo "Betty Project Make Targets"
	@echo "=========================="
	@echo ""
	@echo "Development:"
	@echo "  make install             - Install dependencies"
	@echo "  make up                  - Start development servers"
	@echo "  make down                - Stop development servers"
	@echo "  make fresh               - Kill stale processes and start fresh"
	@echo "  make build               - Build all packages"
	@echo "  make clean               - Clean build artifacts"
	@echo "  make test-e2e            - Run end-to-end tests"
	@echo ""
	@echo "Schema ETL Pipeline (domain-model-separation):"
	@echo "  make schema              - Run full pipeline (infer → SQL → types → migrations)"
	@echo "  make schema-infer        - Infer schema from lms-domain.md"
	@echo "  make schema-sql          - Generate SQL from inferred schema"
	@echo "  make schema-types        - Generate TypeScript types from schema"
	@echo "  make schema-migrations   - Generate migration files"
	@echo "  make schema-validate     - Validate schema consistency"
	@echo "  make schema-status       - Show schema generation status"
	@echo "  make schema-clean        - Clean generated schema artifacts"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-api          - Deploy API to production"
	@echo "  make deploy-web          - Deploy Web to production"
	@echo "  make up-prd              - Deploy both API and Web"
	@echo ""

# Full schema ETL pipeline
schema: schema-infer schema-sql schema-types schema-migrations schema-validate
	@echo ""
	@echo "✓ Schema ETL pipeline complete!"
	@echo "  Source:     packages/schema-etl/schema/lms-domain.md"
	@echo "  Schema:     packages/schema-etl/generated/schema.json"
	@echo "  SQL:        packages/schema-etl/generated/schema.sql"
	@echo "  Types:      packages/schema-etl/generated/schema.d.ts"
	@echo "  Migrations: packages/api/migrations/"

schema-infer:
	@echo "→ Inferring schema from lms-domain.md..."
	cd packages/schema-etl && npx tsx src/infer.ts

schema-sql: schema-infer
	@echo "→ Generating SQL from schema..."
	cd packages/schema-etl && npx tsx src/generate-sql.ts

schema-types: schema-infer
	@echo "→ Generating TypeScript types from schema..."
	cd packages/schema-etl && npx tsx src/generate-types.ts

schema-migrations: schema-sql
	@echo "→ Generating migration files..."
	cd packages/schema-etl && npx tsx src/generate-migrations.ts

schema-validate: schema-infer
	@echo "→ Validating schema..."
	@if [ -f packages/schema-etl/generated/schema.json ]; then \
		echo "✓ Schema is valid"; \
	else \
		echo "✗ Schema validation failed"; \
		exit 1; \
	fi

schema-status:
	@echo "Schema Generation Status"
	@echo "========================"
	@if [ -f packages/schema-etl/schema/lms-domain.md ]; then \
		echo "✓ Source:       packages/schema-etl/schema/lms-domain.md"; \
	else \
		echo "✗ Source:       packages/schema-etl/schema/lms-domain.md (missing)"; \
	fi
	@if [ -f packages/schema-etl/generated/schema.json ]; then \
		echo "✓ Inferred:     packages/schema-etl/generated/schema.json"; \
	else \
		echo "✗ Inferred:     packages/schema-etl/generated/schema.json (missing)"; \
	fi
	@if [ -f packages/schema-etl/generated/schema.sql ]; then \
		echo "✓ SQL:          packages/schema-etl/generated/schema.sql"; \
	else \
		echo "✗ SQL:          packages/schema-etl/generated/schema.sql (missing)"; \
	fi
	@if [ -f packages/schema-etl/generated/schema.d.ts ]; then \
		echo "✓ Types:        packages/schema-etl/generated/schema.d.ts"; \
	else \
		echo "✗ Types:        packages/schema-etl/generated/schema.d.ts (missing)"; \
	fi
	@if [ -d packages/api/migrations ] && [ -n "$$(ls -A packages/api/migrations)" ]; then \
		echo "✓ Migrations:   packages/api/migrations/"; \
	else \
		echo "✗ Migrations:   packages/api/migrations/ (empty)"; \
	fi

schema-clean:
	@echo "Cleaning generated schema artifacts..."
	rm -f packages/schema-etl/generated/schema.json
	rm -f packages/schema-etl/generated/schema.sql
	rm -f packages/schema-etl/generated/schema.d.ts
	@echo "✓ Cleaned"
