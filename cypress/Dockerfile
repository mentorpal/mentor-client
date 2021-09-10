FROM cypress/browsers:node14.15.0-chrome86-ff82
# solve missing-sound-card errors:
# https://github.com/cypress-io/cypress-docker-images/issues/52#issuecomment-446144630
COPY asound.conf /etc/asound.conf
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
RUN npm ci
COPY cypress ./cypress
COPY cypress.json .
ENTRYPOINT ["tail", "-f", "/dev/null"]