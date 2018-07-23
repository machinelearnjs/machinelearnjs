#!/usr/bin/env bash

echo 'running build for prod'
yarn build
cp -a ./build/main/lib/. ./
yarn link
yarn link kalimdor
echo 'finished building for prod'
