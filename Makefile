/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
DOCKER_IMAGE?=mentor-client
TEST_E2E_DOCKER_COMPOSE=docker-compose

node_modules/license-check-and-add:
	npm ci

node_modules/prettier:
	npm ci

.PHONY: clean
clean:
	cd client && $(MAKE) clean
	cd docker && $(MAKE) clean

.PHONY: develop
develop:
	cd client && $(MAKE) develop

.PHONY docker-build:
docker-build:
	docker build \
		--file docker/Dockerfile \
		-t $(DOCKER_IMAGE) \
	.

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: format
format:
	$(MAKE) license && $(MAKE) pretty

.PHONY: license
license: LICENSE LICENSE_HEADER node_modules/license-check-and-add
	npm run license:fix

.PHONY: pretty
pretty: node_modules/prettier
	npm run format

.PHONY: test
test:
	cd client && $(MAKE) test

.PHONY: test-all
test-all:
	#$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-license
	$(MAKE) test-types
	$(MAKE) test

.PHONY: test-audit
test-audit:
	cd client && $(MAKE) test-audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint:
	cd client && $(MAKE) test-lint

.PHONY: test-types
test-types:
	cd client && $(MAKE) test-types

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER node_modules/license-check-and-add
	npm run test:license

.PHONY: test-e2e
test-e2e:
	$(TEST_E2E_DOCKER_COMPOSE) up -d
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run

.PHONY: test-e2e-build
test-e2e-build:
	$(TEST_E2E_DOCKER_COMPOSE) build

.PHONY: test-e2e-exec
test-e2e-exec:
	$(TEST_E2E_DOCKER_COMPOSE) exec -T cypress npx cypress run --headless

.PHONY: test-e2e-up
test-e2e-up:
	$(TEST_E2E_DOCKER_COMPOSE) up -d