mentor-client
==================

Usage
-----

A docker image that serves a web client for question/answer sessions using an AI classifier provided by [mentor-classifier](https://github.com/mentorpal/mentor-classifier) and prerecorded videos or chat bubbles


Config
---------

The client receives these config variables from the [graphql server](https://github.com/mentorpal/mentor-graphql):

- **cmi5Enabled**: Whether cmi5 xapi responses should be logged. Defaults to false

- **cmi5Endpoint**: The cmi5 xapi [endpoint](https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md#81-launch-method) to use for guest sessions, e.g. https://mentorpal.org/lrs/xapi

- **cmi5Fetch**: The cmi5 [fetch](https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md#81-launch-method) url used to retrieve an auth token for guest sessions, e.g. https://mentorpal.org/lrs/auth/guesttoken

- **mentorsDefault**: A list of one or more mentor ids that should be shown by default if no mentor(s) are specified

- **urlGraphql**: The base url for the graphql server [mentor-graphql](https://github.com/mentorpal/mentor-classifier), e.g. https://mentorpal.org/graphql

- **urlVideo**: The base url for the mentor videos, e.g. https://mentorpal.org/videos


Development
-----------

Any changes made to this repo should be covered by tests.

All pushed commits must pass format, lint, type, audit, and license checks. To check all required tests before a commit:

```
make test-all
```

To fix formatting issues:

```
make format
```

To add license headers:

```
make license
```

#### Cypress Testing

To run cypress tests locally with UI you need two shells, first make sure the client is running locally:

```
cd client && make develop
```

...then you can run the full cypress test suite with

```
cd cypress && npm run cy:open
```

...then in the cypress browser window, click a spec to run it.

To run cypress tests headlessly in docker, you do **not** need the client running locally. Just run:

```
make test-e2e
```

Releases
--------

Currently, this image is semantically versioned. When making changes that you want to test in another project, create a branch and PR and then you can release a test tag one of two ways:

To build/push a pre-release semver tag of `mentor-client` for the current commit in your branch

- ensure all github actions tests are passing
- create a [github release](https://github.com/ICTLearningSciences/mentor-client/releases/new) with tag format `[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]*)?$` (e.g. `1.0.0-alpha.1`)
- ensure all github actions tests pass again and the docker `test and publish` action completes
- this will create a tag like `mentorpal/mentor-client:1.0.0-alpha.1`

Once your changes are approved and merged to `main`, you should create a release tag in semver format as follows:

- create a [github release](https://github.com/ICTLearningSciences/mentor-client/releases/new) **from main** with tag format `[0-9]+\.[0-9]+\.[0-9]$` (e.g. `1.0.0`)
- ensure all github actions tests pass and the docker `test and publish` action completes
- this will create a tag like `mentorpal/mentor-client:1.0.0`
