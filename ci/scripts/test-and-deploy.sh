#!/bin/bash

set -e

# Get current dir
PROJECT_DIR="$(git rev-parse --show-toplevel)"

# Run tests
$PROJECT_DIR/ci/scripts/run-tests.sh

# Prepare project
$PROJECT_DIR/ci/scripts/prepare-project.sh

# Deploy project
$PROJECT_DIR/ci/scripts/deploy-on-scalingo.sh
