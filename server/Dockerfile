# Dev stage
FROM node:lts-bullseye-slim as dev

WORKDIR /app

RUN apt-get update \
  && apt-get install -y \
  libcurl4

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i

CMD [ "npm", "run", "dev" ]

# Prod stage
FROM dev as prod

COPY --chown=node:node babel.config.cjs ./
COPY --chown=node:node src ./src
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node dev-setup ./dev-setup

CMD [ "npm", "start" ]
