# Include .env if present
-include .env
export

SCW_REGION ?= fr-par
DOCKER_PLATFORM ?= linux/amd64

.PHONY: help dev build preview docker-build docker-run deploy

help: ## Show available make targets
	@echo "Faltality Build & Automation:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start local Vite development server and open browser once ready
	npm run dev -- --open

build: ## Type-check and build production bundle
	npm run build

preview: ## Preview production build locally
	npm run preview

docker-build: ## Build local Docker image
	docker build -t faltality:latest .

docker-run: ## Run Docker container locally on port 8080
	docker run --rm -p 8080:8080 --name faltality faltality:latest

deploy: ## Build, push, and redeploy container to Scaleway (requires .env)
	@if [ ! -f .env ]; then \
		echo "\033[31mError: .env file missing! Copy .env.example to .env and fill in your variables.\033[0m"; \
		exit 1; \
	fi
	@if [ -z "$$SCW_REGISTRY_IMAGE" ] || [ -z "$$SCW_CONTAINER_ID" ]; then \
		echo "\033[31mError: SCW_REGISTRY_IMAGE or SCW_CONTAINER_ID is not set in .env!\033[0m"; \
		exit 1; \
	fi
	@echo "\033[32m==> Logging in to container registry ($(SCW_REGION))...\033[0m"
	scw registry login region=$(SCW_REGION)
	@echo "\033[32m==> Building multi-platform image ($(DOCKER_PLATFORM))...\033[0m"
	docker build --platform $(DOCKER_PLATFORM) -t $(SCW_REGISTRY_IMAGE) .
	@echo "\033[32m==> Pushing container image to $(SCW_REGISTRY_IMAGE)...\033[0m"
	docker push $(SCW_REGISTRY_IMAGE)
	@echo "\033[32m==> Triggering container redeployment ($(SCW_CONTAINER_ID))...\033[0m"
	scw container container redeploy container-id=$(SCW_CONTAINER_ID) region=$(SCW_REGION)
	@echo "\033[32m==> Deployment completed successfully!\033[0m"
