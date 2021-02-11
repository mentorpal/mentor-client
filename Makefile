DOCKER_IMAGE?=mentor-client
OPENTUTOR_CLIENT_VERSION?=latest
TEST_E2E_DOCKER_COMPOSE=docker-compose

PHONY: clean
clean:
	cd client && $(MAKE) clean
	cd docker && $(MAKE) clean

PHONY: develop
develop:
	cd client && $(MAKE) develop

.PHONY docker-build:
docker-build:
	docker build \
		--file docker/Dockerfile \
		-t $(DOCKER_IMAGE) \
	.

PHONY: format
format:
	cd client && $(MAKE) format

PHONY: test
test:
	cd client && $(MAKE) test

PHONY: test-all
test-all:
	$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-license
	$(MAKE) test-types
	$(MAKE) test

PHONY: test-audit
test-audit:
	cd client && $(MAKE) test-audit

PHONY: test-format
test-format:
	cd client && $(MAKE) test-format

PHONY: test-lint
test-lint:
	cd client && $(MAKE) test-lint

PHONY: test-types
test-types:
	cd client && $(MAKE) test-types

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: license
license: LICENSE LICENSE_HEADER
	cd client && npm ci && npm run license:fix

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	cd client && $(MAKE) test-license

.PHONY: test-e2e
test-e2e:
	$(TEST_E2E_DOCKER_COMPOSE) up -d
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run

.PHONY: test-e2e-build
test-e2e-build:
	$(TEST_E2E_DOCKER_COMPOSE) build

.PHONY: test-e2e-exec
test-e2e-exec:
	$(TEST_E2E_DOCKER_COMPOSE) exec -T cypress npx cypress run

.PHONY: test-e2e-up
test-e2e-up:
	$(TEST_E2E_DOCKER_COMPOSE) up -d
