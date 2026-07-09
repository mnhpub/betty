PIDS_DIR := .pids
LOGS_DIR := .logs

API_PORT ?= 8787
WEB_PORT ?= 3000
APP_PORT ?= 8081

.PHONY: install build build-api build-web build-app clean up down fresh test-e2e

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
