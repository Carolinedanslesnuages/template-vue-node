#!/bin/bash

set -e

# Get project root dir
PROJECT_DIR="$(git rev-parse --show-toplevel)"

# Get client dir
CLIENT_DIR="$(cd $PROJECT_DIR/client; pwd)"

# Get server dir
SERVER_DIR="$(cd $PROJECT_DIR/server; pwd)"

# Build client
echo "1. Build client"
cd $CLIENT_DIR
npm ci --no-optional
npm run build

# Move client to $STATIC_DIR
echo "2. Move client code to $SERVER_DIR$STATIC_DIR"
mv $CLIENT_DIR/dist $SERVER_DIR$STATIC_DIR

# Prepare files for scalingo
echo "3. Move scalingo specific files to $SERVER_DIR/"
cp $PROJECT_DIR/ci/scalingo/Procfile $PROJECT_DIR/ci/scalingo/.buildpacks $PROJECT_DIR/ci/nginx/.htpasswd $SERVER_DIR/
cp $PROJECT_DIR/ci/nginx/nginx-app.conf.erb $SERVER_DIR/nginx.conf.erb

# Create archive of server
echo "4. Create archive with server and client (client will be in $SERVER_DIR$STATIC_DIR)"
cd $PROJECT_DIR
OS=`uname`
if [ "$OS" = "Darwin" ]; then # BSD tar uses "-s /current/expected/"...
  tar czf $PROJECT_DIR/$ARCHIVE_FILENAME -s /^server/master/ --exclude=./init-db --exclude=babel.config.js --exclude=.eslintrc.js server
else # ...while GNU tar uses "--transform s/current/expected/"
  tar czf $PROJECT_DIR/$ARCHIVE_FILENAME --transform "s/^server/master/" --exclude=./init-db --exclude=babel.config.js --exclude=.eslintrc.js server
fi

echo "5. Clean up"
rm -rf $PROJECT_DIR/server$STATIC_DIR
rm $PROJECT_DIR/server/.htpasswd
rm $PROJECT_DIR/server/.buildpacks
rm $PROJECT_DIR/server/Procfile
rm $PROJECT_DIR/server/nginx.conf.erb

echo "6. Archive ready to deploy at $PROJECT_DIR/$ARCHIVE_FILENAME:"
ls -l $PROJECT_DIR/$ARCHIVE_FILENAME
