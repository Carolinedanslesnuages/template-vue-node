#!/bin/bash

# Colorize terminal
red='\e[0;31m'
no_color='\033[0m'

# Get project directories
PROJECT_DIR="$(git rev-parse --show-toplevel)"
ACT_DIR="$PROJECT_DIR/ci/act"

# Get Date
NOW=$(date +'%Y-%m-%dT%H-%M-%SZ')

# Set default values
EVENT_PATH="$ACT_DIR/events/pull_request_base_develop.json"

# Declare script helper
TEXT_HELPER="\nThis script aims to run CI locally for tests.
Following flags are available:

  -e, --event   (Optional) Event file in '/act/events/' that will trigger workflows. e.g: 'pull_request_draft.json'.
                Default is 'pull_request_base_develop.json'.

  -h, --help    Print script help.\n\n"

print_help() {
  printf "$TEXT_HELPER"
}

# Parse options
while getopts :h-:e: flag
do
  case "${flag}" in
    -)
      case "${OPTARG}" in
        event)
          echo "${!OPTIND}"
          EVENT_PATH="$ACT_DIR/events/${!OPTIND}";;
        help | *)
          print_help
          exit 0;;
      esac;;
    e)
      echo "${OPTARG}"
      EVENT_PATH="$ACT_DIR/events/${OPTARG}";;
    h | *)
      print_help
      exit 0;;
  esac
done

install_act() {
  printf "\n${red}Optional.${no_color} Installs act...\n"
  curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
  echo "\nact version $(act --version) installed\n"
}

if [ -z "$(act --version)" ]; then
  while true; do
    read -p "\nYou need act to run this script. Do you wish to install act?\n" yn
    case $yn in
      [Yy]*)
        install_act;;
      [Nn]*)
        exit;;
      *)
        echo "\nPlease answer yes or no.\n";;
    esac
  done
fi


printf "\n${red}I.${no_color} Builds docker image use by act to run our application\n"
cd $ACT_DIR/docker
docker build \
  --tag act/ubuntu:1.0.0 \
  .


printf "\n${red}II.${no_color} Displays workflow list\n"
EVENT_NAME=$(cat "$EVENT_PATH" | jq -r 'keys | first')
act $EVENT_NAME \
  --workflows $ACT_DIR/workflows \
  --list


printf "\n${red}III.${no_color} Displays workflow graph\n"
act $EVENT_NAME \
  --workflows $ACT_DIR/workflows \
  --graph


printf "\n${red}IV.${no_color} Runs locally GitHubActions workflow\n"
cd $PROJECT_DIR
act $EVENT_NAME \
  --platform ubuntu-latest=act/ubuntu:1.0.0 \
  --workflows $ACT_DIR/workflows \
  --eventpath $EVENT_PATH \
  --use-gitignore \
  --artifact-server-path $ACT_DIR/artifacts \
  --env GITHUB_RUN_ID=$NOW \
  --rm
  # --env-file $PROJECT_DIR/server/.env \
  # --secret GITHUB_TOKEN=fake-token


printf "\n${red}V.${no_color} Retrieves artifacts\n"
if [ -d "$ACT_DIR/artifacts/$NOW" ] && [ -n "$(find $ACT_DIR/artifacts/$NOW -type f -name '*.gz__')" ]; then
  find $ACT_DIR/artifacts/$NOW -type f -name "*.gz__" | while read f; do
    mv -- "$f" "${f%.gz__}.gz"
    gunzip "${f%.gz__}.gz"
  done
fi


if [ -d "$PROJECT_DIR/workflow" ]; then
  printf "\n${red}VI.${no_color} Remove files added by act\n"
  rm -rf "$PROJECT_DIR/workflow"
fi
