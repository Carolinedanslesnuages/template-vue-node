#!/bin/bash

set -e

# Get project root dir
PROJECT_DIR="$(git rev-parse --show-toplevel)"

# Get archive to send
echo "1. Get archive"
ARCHIVE=$PROJECT_DIR/server.tgz

# Send archive
echo "2. Check prerequisite"
SCALINGO_API_TOKEN=${SCALINGO_API_TOKEN:?SCALINGO_API_TOKEN not set!}

echo "3. Login to scalingo"
scalingo login --api-token $SCALINGO_API_TOKEN

echo "4. Set ENV on $SCALINGO_APP on scalingo"
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set HTPASSWD_DIR=/app
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set APP_API_HOST=$APP_API_HOST
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set APP_API_PORT=$APP_API_PORT
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set STATIC_DIR=/app$STATIC_DIR
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set NGINX_VERSION=$NGINX_VERSION
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set EMAIL_SENDER=$EMAIL_SENDER
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set PUBLIC_URL=$PUBLIC_URL
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set TOKEN_SECRET=$TOKEN_SECRET
if [ $APP_ALLOWED_IPS ]
then
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set APP_ALLOWED_IPS=$APP_ALLOWED_IPS
fi
if [ $EXPERIMENTATION ]
then
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set EXPERIMENTATION=$EXPERIMENTATION
fi
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION env-set

echo "5. Deploy $SCALINGO_APP on scalingo"
scalingo --app $SCALINGO_APP --region $SCALINGO_REGION deploy $ARCHIVE_FILENAME
