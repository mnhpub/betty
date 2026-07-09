PIDS_DIR := .pids
LOGS_DIR := .logs

.PHONY: install build build-api build-web build-app clean up down

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

up:
	@mkdir -p $(PIDS_DIR) $(LOGS_DIR)
	@bash -c 'cd packages/api && exec bun run dev' > $(LOGS_DIR)/api.log 2>&1 & echo $$! > $(PIDS_DIR)/api.pid
	@bash -c 'cd packages/web && exec bun run dev' > $(LOGS_DIR)/web.log 2>&1 & echo $$! > $(PIDS_DIR)/web.pid
	@bash -c 'cd packages/app && exec bun run start' > $(LOGS_DIR)/app.log 2>&1 & echo $$! > $(PIDS_DIR)/app.pid
	@sleep 1
	@echo "api  -> http://localhost:4000  (log: $(LOGS_DIR)/api.log)"
	@echo "web  -> http://localhost:3000  (log: $(LOGS_DIR)/web.log)"
	@echo "app  -> Metro on :8081         (log: $(LOGS_DIR)/app.log)"

down:
	@for f in $(PIDS_DIR)/*.pid; do \
		[ -f "$$f" ] || continue; \
		pid=$$(cat "$$f"); \
		if kill -0 "$$pid" 2>/dev/null; then kill "$$pid" && echo "stopped $$(basename $$f .pid) (pid $$pid)"; fi; \
		rm -f "$$f"; \
	done
