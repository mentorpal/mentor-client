.env.development:
	@echo "CMI5_ENDPOINT=https://dev.mentorpal.org/lrs/xapi" >> .env.development
	@echo "CMI5_FETCH=https://dev.mentorpal.org/lrs/auth/guesttoken" >> .env.development
	@echo "MENTOR_API_URL=https://dev.mentorpal.org/mentor-api" > .env.development
	@echo "MENTOR_VIDEO_HOST=https://video.mentorpal.org/videos" >> .env.development
	@echo "Set up  a default .env.development file"
	@echo "that configures MENTOR_API_URL=https://dev.mentorpal.org/mentor-api."
	@echo "This file should not be committed. "
	@echo "Feel free to change to point to a local server if you're running one."

.PHONY: clean
clean:
	rm -rf node_modules .cache public

.PHONY: develop
develop: .env.development node_modules/gatsby-cli
	npx gatsby develop

.PHONY: format
format: node_modules/prettier
	yarn run format

node_modules/cypress:
	yarn install --frozen-lockfile

node_modules/eslint:
	yarn install --frozen-lockfile

node_modules/gatsby-cli:
	yarn install --frozen-lockfile

node_modules/jest:
	yarn install --frozen-lockfile

node_modules/jest:
	yarn install --frozen-lockfile

node_modules/prettier:
	yarn install --frozen-lockfile

node_modules/typescript:
	yarn install --frozen-lockfile

.PHONY: test
test: node_modules/jest
	yarn run test

PHONY: test-all
test-all:
	$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	# $(MAKE) test-types
	$(MAKE) test-cypress
	$(MAKE) test

.PHONY: test-audit
test-audit:
	yarn run test:audit

.PHONY: test-format
test-format: node_modules/prettier
	yarn run test:format

.PHONY: test-format
test-lint: node_modules/eslint
	yarn run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	yarn run test:types

.PHONY: test-cypress
test-cypress: node_modules/cypress
	npm run test:cypress
