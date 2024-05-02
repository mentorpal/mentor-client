FROM cypress/browsers:node-20.11.0-chrome-121.0.6167.184-1-ff-123.0-edge-121.0.2277.128-1
# solve missing-sound-card errors:
# https://github.com/cypress-io/cypress-docker-images/issues/52#issuecomment-446144630
COPY asound.conf /etc/asound.conf
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
RUN npm ci
COPY cypress ./cypress
COPY cypress.config.ts .
ENTRYPOINT ["tail", "-f", "/dev/null"]