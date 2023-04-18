#!/bin/bash

# set -e

# Colorize terminal
red='\e[0;31m'
no_color='\033[0m'
# Console step increment
i=1


printf "\n${red}${i}.${no_color} Recover artifacts\n"
i=$(($i + 1))

echo "\nCurl : https://api.github.com/repos/${OWNER}/${REPO}/commits/${REF}/check-suites\n"
SUITE_ID=$(curl \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${TOKEN}" \
  "https://api.github.com/repos/${OWNER}/${REPO}/commits/${REF}/check-suites" \
  | jq '.check_suites | first | .id')
echo "\nSuite ID : $SUITE_ID\n"

echo "\nCurl : https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${PREVIOUS_WORKFLOW_ID}/runs\n"
RUN_ID=$(curl \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${TOKEN}" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${PREVIOUS_WORKFLOW_ID}/runs" \
  | jq '.workflow_runs | first | .id')
echo "\nRun ID : $RUN_ID\n"

echo "\nCurl : https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${RUN_ID}/artifacts\n"
ARTIFACT_ID=$(curl \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${TOKEN}" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${RUN_ID}/artifacts" \
  | jq '[.artifacts[] | select(.name == "vulnerability-report")] | first | .id')
echo "\nArtifact ID : $ARTIFACT_ID\n"

ARTIFACT_URL="https://github.com/${OWNER}/${REPO}/suites/$SUITE_ID/artifacts/$ARTIFACT_ID"
echo "\nArtifact URL : $ARTIFACT_URL\n"

echo "\nCurl : https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${ARTIFACT_ID}/zip\n"
curl -L -o vulnerability_report.zip \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${TOKEN}" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${ARTIFACT_ID}/zip" \
  && unzip vulnerability_report.zip -d vulnerability_report \
  && rm vulnerability_report.zip


VULNERABILITY_REPORT_BODY="# Security report"


if [ -f "vulnerability_report/dependencies_scan.json" ]; then
  SCAN_DEPENDENCIES=true
  printf "\n${red}${i}.${no_color} Add dependencies table to the vulnerability report body\n"
  i=$(($i + 1))


  FORMATED_DEPENDENCIES_REPORT="$(cat vulnerability_report/dependencies_scan.json | jq '[ .[] | select(.Vulnerabilities != null) | {
    pkgName: .Target,
    length: .Vulnerabilities | length,
    vulnerabilityType: {
      critical: [.Vulnerabilities[] | select(.Severity == "CRITICAL")] | length,
      high: [.Vulnerabilities[] | select(.Severity == "HIGH")] | length,
      medium: [.Vulnerabilities[] | select(.Severity == "MEDIUM")] | length,
      low: [.Vulnerabilities[] | select(.Severity == "LOW")] | length,
      unknown: [.Vulnerabilities[] | select(.Severity == "UNKNOWN")] | length,
    },
  }]' )"

  DEPENDENCIES_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .length] | add')
  DEPENDENCIES_CRITICAL_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .vulnerabilityType .critical] | add')
  DEPENDENCIES_HIGH_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .vulnerabilityType .high] | add')
  DEPENDENCIES_MEDIUM_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .vulnerabilityType .medium] | add')
  DEPENDENCIES_LOW_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .vulnerabilityType .low] | add')
  DEPENDENCIES_UNKNOWN_ISSUES_COUNT=$(echo "$FORMATED_DEPENDENCIES_REPORT" | jq '[.[] .vulnerabilityType .unknown] | add')

  DEPENDENCIES_REPORT_TABLE="| Package Name \
| Critical \
| High \
| Medium \
| Low \
| Unknown \
| Total |
|:--|:-:|:-:|:-:|:-:|:-:|:-:|"

  for row in $(echo "${FORMATED_DEPENDENCIES_REPORT}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }
    DEPENDENCIES_REPORT_TABLE="$DEPENDENCIES_REPORT_TABLE
| $(_jq '.pkgName') \
| $(_jq '.vulnerabilityType.critical') \
| $(_jq '.vulnerabilityType.high') \
| $(_jq '.vulnerabilityType.medium') \
| $(_jq '.vulnerabilityType.low') \
| $(_jq '.vulnerabilityType.unknown') \
| **$(_jq '.length')** |"
  done

  DEPENDENCIES_REPORT_TABLE="$DEPENDENCIES_REPORT_TABLE
| **Total** \
| **$DEPENDENCIES_CRITICAL_ISSUES_COUNT** \
| **$DEPENDENCIES_HIGH_ISSUES_COUNT** \
| **$DEPENDENCIES_MEDIUM_ISSUES_COUNT** \
| **$DEPENDENCIES_LOW_ISSUES_COUNT** \
| **$DEPENDENCIES_UNKNOWN_ISSUES_COUNT** \
| **$DEPENDENCIES_ISSUES_COUNT** |"

  VULNERABILITY_REPORT_BODY=$(cat <<EOF
$VULNERABILITY_REPORT_BODY

## Dependencies scan

$(if [ $DEPENDENCIES_ISSUES_COUNT = 'null' ]; then
  printf ":white_check_mark: No security issues were detected over dependencies."
else
  printf ":warning: **$DEPENDENCIES_ISSUES_COUNT** security issues were detected over dependencies.

$DEPENDENCIES_REPORT_TABLE"
fi)
EOF
)
fi

#---------------------------#
# Builds config scan report #
#---------------------------#
if [ -f "vulnerability_report/config_scan.json" ]; then
  SCAN_CONFIG=true
  printf "\n${red}${i}.${no_color} Add config files table to the vulnerability report body\n"
  i=$(($i + 1))

  FORMATED_CONFIG_REPORT="$(cat vulnerability_report/config_scan.json | jq '[ .[] | select(.Misconfigurations != null) | {
    cfgFile: .Target,
    length: .Misconfigurations | length,
    vulnerabilityType: {
      critical: [.Misconfigurations[] | select(.Severity == "CRITICAL")] | length,
      high: [.Misconfigurations[] | select(.Severity == "HIGH")] | length,
      medium: [.Misconfigurations[] | select(.Severity == "MEDIUM")] | length,
      low: [.Misconfigurations[] | select(.Severity == "LOW")] | length,
      unknown: [.Misconfigurations[] | select(.Severity == "UNKNOWN")] | length,
    },
  }]' )"

  CONFIG_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .length] | add')
  CONFIG_CRITICAL_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .vulnerabilityType .critical] | add')
  CONFIG_HIGH_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .vulnerabilityType .high] | add')
  CONFIG_MEDIUM_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .vulnerabilityType .medium] | add')
  CONFIG_LOW_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .vulnerabilityType .low] | add')
  CONFIG_UNKNOWN_ISSUES_COUNT=$(echo "$FORMATED_CONFIG_REPORT" | jq '[.[] .vulnerabilityType .unknown] | add')

  CONFIG_REPORT_TABLE="| Config File \
| Critical \
| High \
| Medium \
| Low \
| Unknown \
| Total |
|:--|:-:|:-:|:-:|:-:|:-:|--:|"

  for row in $(echo "${FORMATED_CONFIG_REPORT}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }
    CONFIG_REPORT_TABLE="$CONFIG_REPORT_TABLE
| $(_jq '.cfgFile') \
| $(_jq '.vulnerabilityType.critical') \
| $(_jq '.vulnerabilityType.high') \
| $(_jq '.vulnerabilityType.medium') \
| $(_jq '.vulnerabilityType.low') \
| $(_jq '.vulnerabilityType.unknown') \
| **$(_jq '.length')** |"
  done

  CONFIG_REPORT_TABLE="$CONFIG_REPORT_TABLE
| **Total** \
| **$CONFIG_CRITICAL_ISSUES_COUNT** \
| **$CONFIG_HIGH_ISSUES_COUNT** \
| **$CONFIG_MEDIUM_ISSUES_COUNT** \
| **$CONFIG_LOW_ISSUES_COUNT** \
| **$CONFIG_UNKNOWN_ISSUES_COUNT** \
| **$CONFIG_ISSUES_COUNT** |"

  VULNERABILITY_REPORT_BODY=$(cat <<EOF
$VULNERABILITY_REPORT_BODY

## Config scan

$(if [ $CONFIG_ISSUES_COUNT = 'null' ]; then
  printf ":white_check_mark: No security issues were detected over config files."
else
  printf ":warning: **$CONFIG_ISSUES_COUNT** security issues were detected over config files.

$CONFIG_REPORT_TABLE"
fi)
EOF
)
fi


#--------------------------#
# Builds image scan report #
#--------------------------#
IMAGES_SCAN_DIR="vulnerability_report/images"
if [ -d "$IMAGES_SCAN_DIR" ] && [ "$(ls -A $IMAGES_SCAN_DIR)" ]; then
  SCAN_IMAGES=true
  printf "\n${red}${i}.${no_color} Add images table to the vulnerability report body\n"
  i=$(($i + 1))

  FORMATED_IMAGES_REPORT="$(jq -s 'map(.Results[])' $IMAGES_SCAN_DIR/* | jq '[ .[] | select(.Vulnerabilities != null) | {
      imgName: .Target,
      length: .Vulnerabilities | length,
      vulnerabilityType: {
        critical: [.Vulnerabilities[] | select(.Severity == "CRITICAL")] | length,
        high: [.Vulnerabilities[] | select(.Severity == "HIGH")] | length,
        medium: [.Vulnerabilities[] | select(.Severity == "MEDIUM")] | length,
        low: [.Vulnerabilities[] | select(.Severity == "LOW")] | length,
        unknown: [.Vulnerabilities[] | select(.Severity == "UNKNOWN")] | length,
      },
    }]' )"

  IMAGES_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .length] | add')
  IMAGES_CRITICAL_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .vulnerabilityType .critical] | add')
  IMAGES_HIGH_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .vulnerabilityType .high] | add')
  IMAGES_MEDIUM_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .vulnerabilityType .medium] | add')
  IMAGES_LOW_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .vulnerabilityType .low] | add')
  IMAGES_UNKNOWN_ISSUES_COUNT=$(echo "$FORMATED_IMAGES_REPORT" | jq '[.[] .vulnerabilityType .unknown] | add')

  IMAGES_REPORT_TABLE="| Image Name \
| Critical \
| High \
| Medium \
| Low \
| Unknown \
| Total |
|:--|:-:|:-:|:-:|:-:|:-:|--:|"

  for row in $(echo "${FORMATED_IMAGES_REPORT}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }
    IMAGES_REPORT_TABLE="$IMAGES_REPORT_TABLE
| $(_jq '.imgName') \
| $(_jq '.vulnerabilityType.critical') \
| $(_jq '.vulnerabilityType.high') \
| $(_jq '.vulnerabilityType.medium') \
| $(_jq '.vulnerabilityType.low') \
| $(_jq '.vulnerabilityType.unknown') \
| **$(_jq '.length')** |"
  done

  IMAGES_REPORT_TABLE="$IMAGES_REPORT_TABLE
| **Total** \
| **$IMAGES_CRITICAL_ISSUES_COUNT** \
| **$IMAGES_HIGH_ISSUES_COUNT** \
| **$IMAGES_MEDIUM_ISSUES_COUNT** \
| **$IMAGES_LOW_ISSUES_COUNT** \
| **$IMAGES_UNKNOWN_ISSUES_COUNT** \
| **$IMAGES_ISSUES_COUNT** |"

  VULNERABILITY_REPORT_BODY=$(cat <<EOF
$VULNERABILITY_REPORT_BODY

## Images scan

$(if [ $IMAGES_ISSUES_COUNT = 'null' ]; then
  printf ":white_check_mark: No security issues were detected over images."
else
  printf ":warning: **$IMAGES_ISSUES_COUNT** security issues were detected over images.

$IMAGES_REPORT_TABLE"
fi)
EOF
)
fi


if [ "$SCAN_DEPENDENCIES" = true ] || [ "$SCAN_CONFIG" = true ] || [ "$SCAN_IMAGES" = true ]; then
  printf "\n${red}${i}.${no_color} Add artifacts download url to the vulnerability report body\n"
  i=$(($i + 1))

  VULNERABILITY_REPORT_BODY=$(cat <<EOF
$VULNERABILITY_REPORT_BODY

## Download report

Click [here]($ARTIFACT_URL) to download the full vulnerability report.
EOF
)

  printf "\nVulnerability report preview :\n\n$VULNERABILITY_REPORT_BODY\n"

  echo 'VULNERABILITY_REPORT_BODY<<EOF' >> $GITHUB_ENV
  echo "$VULNERABILITY_REPORT_BODY" >> $GITHUB_ENV
  echo 'EOF' >> $GITHUB_ENV
fi

printf "\n${red}${i}.${no_color} Cleans file system residues\n"
rm -rf vulnerability_report
