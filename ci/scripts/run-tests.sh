#!/bin/bash

set -e

echo "1. Set variables"
# Get project root dir
PROJECT_DIR="$(git rev-parse --show-toplevel)"

# Get client dir
CLIENT_DIR="$(cd $PROJECT_DIR/client; pwd)"

# Get server dir
SERVER_DIR="$(cd $PROJECT_DIR/server; pwd)"

# Get node version
NODE_VERSION="$(node --version)"

# Get npm version
NPM_VERSION="$(npm --version)"

# Prepare server and launch tests
echo "2. Prepare server | npm version: $NPM_VERSION"
cd $SERVER_DIR
npm ci

echo "3. Test server"
npm test

# Run server for end-to-end test
echo "4. Start server in CI mode & NODE_ENV: $NODE_ENV | node version: $NODE_VERSION"
NODE_ENV=test DEV_SETUP=true npm run start-ci

# Prepare client and launch tests
echo "5. Prepare client | npm version: $NPM_VERSION"
cd $CLIENT_DIR
npm ci

echo "6. Launch unit tests"
npm test

echo "7. Launch component tests"
npm run test:ct-ci

echo "8. Download MailHog"
if [ "$OS" = "Darwin" ]; then # BSD tar uses "-s /current/expected/"...
  wget https://github.com/mailhog/MailHog/releases/download/v1.0.0/MailHog_darwin_amd64 -O MailHog_amd64
else # ...while GNU tar uses "--transform s/current/expected/"
  wget https://github.com/mailhog/MailHog/releases/download/v1.0.0/MailHog_linux_amd64  -O MailHog_amd64
fi
chmod +x MailHog_amd64

echo "9. Start MailHog in background"
./MailHog_amd64 > /dev/null 2>&1 &

echo "10. Launch end-to-end tests in CI mode"
npm start &
sleep 5
PUBLIC_URL=http://localhost:8080 npm run test:e2e-ci
kill $(lsof -t -i:8080)

echo "11. Kill and remove Mailhog"
killall MailHog_amd64
rm ./MailHog_amd64

echo "12. stop app-api"
cd $SERVER_DIR
npm run stop-ci
