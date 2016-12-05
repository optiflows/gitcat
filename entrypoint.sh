#!/bin/ash

jq '.organization = "'${GITHUB_ORGANIZATION}'" | .manifest = "'${GITHUB_ORGANIZATION_MANIFEST}'"' ./webapp/configs/github.json > /tmp/github.json
mv /tmp/github.json ./webapp/configs/.github.json

python3 gitcat.py
