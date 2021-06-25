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
develop: .env.development node_modules/gatsby
	npx gatsby develop

.PHONY: format
format:
	npm run format

.PHONY: license
license:
	cd .. && $(MAKE) license

node_modules/eslint:
	npm ci 

node_modules/gatsby-cli:
	npm ci 

node_modules/typescript:
	npm ci 

.PHONY: test
test:
	npm run test

.PHONY: test-all
test-all:
	$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-types
	$(MAKE) test

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format:
	cd .. && $(MAKE) test-format

.PHONY: test-license
test-license:
	cd .. && $(MAKE) test-license

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types