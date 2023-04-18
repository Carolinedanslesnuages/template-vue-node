FROM cypress/included:10.8.0

WORKDIR /app

COPY package*.json ./
RUN npm i --omit optional

COPY cypress.config.js ./cypress.config.js
COPY src ./src
COPY tests ./tests

ENTRYPOINT []
CMD [ "cypress", "run" ]
