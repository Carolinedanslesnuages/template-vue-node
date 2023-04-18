#!/bin/bash

# Colorize terminal
red='\e[0;31m'
no_color='\033[0m'
# Console step increment
i=1


print_help() {
  printf "\nThis script aims to source env file.
Following flags are available :

-e    Env file path, can be called multiple times (minimum one call)

-h    Print script help.\n\n"
}

while getopts e:h flag
do
  case "${flag}" in
    e)
      FILES+=($OPTARG);;
    h|*)
      print_help
      exit 0;;
  esac
done
shift $((OPTIND -1))

if [ -z "$FILES" ]; then
  echo "This script require at least one argument."
  print_help
  exit 1
fi

for val in "${FILES[@]}"; do
  [ ! -f $val ] && continue
  printf "\n${red}${i}.${no_color} Source file ${red}${val}${no_color}\n\n"
  i=$(($i + 1))

  export $(grep -v '^#' "$val" | xargs)
done
