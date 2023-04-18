# Dev stage
FROM node:lts-bullseye-slim as dev

WORKDIR /app

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i --omit optional

CMD [ "npm", "start" ]

# Build stage
FROM dev as build

COPY index.html vite.config.js .browserslistrc manifest.js windi.config.js ./
COPY public ./public
COPY src ./src
COPY tests ./tests

RUN npm run build

CMD [ "npm", "preview" ]

# Prod stage
# No prod stage because of nginx running on sclaingo with nginx.conf.erb config file
