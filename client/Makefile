.env.development:
	@echo "MENTOR_API_URL=https://dev.mentorpal.org/mentor-api" > .env.development
	@echo "MENTOR_VIDEO_HOST=http://video.mentorpal.org" >> .env.development
	@echo "Set up  a default .env.development file"
	@echo "that configures MENTOR_API_URL=https://dev.mentorpal.org/mentor-api."
	@echo "This file should not be committed. "
	@echo "Feel free to change to point to a local server if you're running one."

.PHONY: audit-fix
audit-fix:
	npm audit fix

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

node_modules/prettier:
	npm install

node_modules/typescript:
	npm install

.PHONY: test
test:
	npm install && npm run test:all

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
