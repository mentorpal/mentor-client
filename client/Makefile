.env.development:
	@echo "CMI5_ENDPOINT=https://dev.mentorpal.org/lrs/xapi" > .env.development
	@echo "CMI5_FETCH=https://dev.mentorpal.org/lrs/auth/guesttoken" >> .env.development
	@echo "MENTOR_API_URL=https://dev.mentorpal.org/mentor-api" >> .env.development
	@echo "MENTOR_VIDEO_URL=https://video.mentorpal.org/videos" >> .env.development
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
	npm run format

node_modules/eslint:
	npm install 

node_modules/gatsby-cli:
	npm install 

node_modules/jest:
	npm install 

node_modules/jest:
	npm install 

node_modules/prettier:
	npm install 

node_modules/typescript:
	npm install 

.PHONY: test
test: node_modules/jest
	npm run test

PHONY: test-all
test-all:
	# $(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-license
	# $(MAKE) test-types
	$(MAKE) test

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-format
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: license
license: LICENSE LICENSE_HEADER node_modules/license-check-and-add
	npm run license:fix

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER node_modules/license-check-and-add
	npm run test:license

node_modules/license-check-and-add:
	npm ci