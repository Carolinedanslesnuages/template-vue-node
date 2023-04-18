#!/bin/bash

# Colorize terminal
red='\e[0;31m'
no_color='\033[0m'
# Console step increment
i=1

# Get project directories
PROJECT_DIR="$(git rev-parse --show-toplevel)"
DOCKER_DIR="$PROJECT_DIR/ci/docker"
ENV_DIR="$PROJECT_DIR/ci/env"
VULN_SCAN_DIR="$PROJECT_DIR/ci/vulnerability-report"

# Prepare scan directory
mkdir -p $VULN_SCAN_DIR

# Default command
SCAN_DEPENDENCIES=false
SCAN_CONFIG=false
SCAN_IMAGES=false

# Declare script helper
TEXT_HELPER="\nThis script aims to perform vulnerability detection.

Following flags are available:

  -d, --dependencies  Dependency vulnerability analysis across the project.

  -c, --config        Config files analysis across the project.

  -i, --images        Docker images analysis across the project.

  -h, --help          Print script help.\n\n"

print_help() {
  printf "$TEXT_HELPER"
}

# Parse options
while getopts :hdci-: flag
do
  case "${flag}" in
    -)
      case "${OPTARG}" in
        dependencies)
          SCAN_DEPENDENCIES=true;;
        config)
          SCAN_CONFIG=true;;
        images)
          SCAN_IMAGES=true;;
        help | *)
          print_help
          exit 0;;
      esac;;
    d)
      SCAN_DEPENDENCIES=true;;
    c)
      SCAN_CONFIG=true;;
    i)
      SCAN_IMAGES=true;;
    h | *)
      print_help
      exit 0;;
  esac
done


# Installs trivy if not on the os
if [ -z "$(trivy -v)" ]; then
  printf "\n${red}Optional.${no_color} Installs trivy...\n"
  curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.28.1
  echo "\ntrivy version '$(trivy --version)' installed\n"
fi

# Installs jq if not on the os
if [ -z "$(jq --version)" ]; then
  printf "\n${red}Optional.${no_color} Installs jq...\n"
  JQ=/usr/bin/jq
  curl https://stedolan.github.io/jq/download/linux64/jq > $JQ && chmod +x $JQ
  ls -la $JQ
  echo "\njq version '$(jq --version)' installed\n"
fi


# Scan dependencies
if [ "$SCAN_DEPENDENCIES" = true ]; then
  printf "\n${red}${i}.${no_color} Scan dependencies vulnerability\n"
  i=$(($i + 1))
  cd "$PROJECT_DIR"

  trivy fs \
    --vuln-type library \
    --format json \
    --output "$VULN_SCAN_DIR/dependencies_scan_temp.json" \
    .

  cat "$VULN_SCAN_DIR/dependencies_scan_temp.json" \
    | jq '[.Results[] | select(.Target | contains("node_modules/") | not)]' \
    > "$VULN_SCAN_DIR/dependencies_scan.json"
  rm "$VULN_SCAN_DIR/dependencies_scan_temp.json"

  # npm explain safe-buffer --json # --prod
fi

# Scan config files
if [ "$SCAN_CONFIG" = true ]; then
  printf "\n${red}${i}.${no_color} Scan config vulnerability\n"
  i=$(($i + 1))
  cd "$PROJECT_DIR"

  trivy config \
    --format json \
    --output "$VULN_SCAN_DIR/config_scan_temp.json" \
    .

  cat "$VULN_SCAN_DIR/config_scan_temp.json" \
    | jq '[.Results[] | select(.Target | contains("node_modules/") | not) | select(.Target | contains("act/") | not)]' \
    > "$VULN_SCAN_DIR/config_scan.json"
  rm "$VULN_SCAN_DIR/config_scan_temp.json"
fi

# Scan docker images
if [ "$SCAN_IMAGES" = true ]; then
  printf "\n${red}${i}.${no_color} Scan docker images\n"
  i=$(($i + 1))
  cd "$PROJECT_DIR"

  mkdir -p "$VULN_SCAN_DIR/images"

  docker-compose \
    --file "$DOCKER_DIR/docker-compose.prod.yml" \
    --env-file "$ENV_DIR/.env.prod" \
    build
    # --parallel

  for image in $(cat ./ci/docker/docker-compose.prod.yml | docker run -i --rm mikefarah/yq '.services.*.image'); do
    trivy image \
      --vuln-type os \
      --format json \
      --output "$VULN_SCAN_DIR/images/$(echo $image | awk '{split($0,a,":"); print a[1]}')_scan.json" \
      $image
  done
fi
