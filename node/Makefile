SHELL:=/bin/bash
DOCKER_IMAGE?=mentor-client
DOCKER_CONTAINER=mentor-client
DIR=$(shell pwd)
PROJECT_ROOT?=$(shell git rev-parse --show-toplevel 2> /dev/null)
PROJECT_NAME=$(shell v='$(PROJECT_ROOT)'; echo "$${v\#\#*/}")
CLIENT=$(PROJECT_ROOT)/client
BUILD=$(DIR)/build


.PHONY clean:
clean:
	rm -rf build


build/client:
	mkdir -p build
	rsync -rv --exclude=node_modules $(CLIENT) build


.PHONY docker-build:
docker-build: clean build/client
	docker build \
		-t $(DOCKER_IMAGE) \
	.

.PHONY docker-run:
docker-run:
	docker run \
			-it \
			--rm \
			--name $(DOCKER_CONTAINER) \
			-e MENTOR_API_URL="https://dev.mentorpal.org/mentor-api" \
			-e MENTOR_VIDEO_URL="https://video.mentorpal.org/videos" \
			-p 3000:3000 \
		$(DOCKER_IMAGE) 


.PHONY docker-run-shell:
docker-run-shell:
	docker run \
			-it \
			--rm \
			--name $(DOCKER_CONTAINER) \
			-p 3000:3000 \
			--entrypoint /bin/bash \
		$(DOCKER_IMAGE) 
		

.PHONY exec-shell:
exec-shell:
	docker exec \
			-it \
		$(DOCKER_CONTAINER) \
			bash

.PHONY: audit-js
test-audit:
	npm run test:audit