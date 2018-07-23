#!/usr/bin/env bash

echo 'Running an integration tests'
docker build -t kalimdor:latest .
docker run --rm kalimdor:latest './scripts/build-prod.sh'
