#!/usr/bin/env bash

echo 'Running an integration tests'

echo '1. building a kalimdor docker image'
docker build -t kalimdor:latest .

echo '2. Running build-prod.sh in a temporary container'
docker run --rm -it kalimdor:latest './scripts/build-prod.sh'
