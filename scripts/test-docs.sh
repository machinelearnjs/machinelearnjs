#!/usr/bin/env bash

echo "1. Building the project"
yarn build

echo "2. Copying test/docs/dummy.json to docs/docs.json"
cp ./test/docs/dummy.json ./docs/docs.json

echo "3. Running docs:helper target"
npx jest -t "docs:helper"
