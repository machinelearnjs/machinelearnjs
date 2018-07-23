#!/usr/bin/env bash

echo 'Building bundles for the production purpose'

# Standard build
echo '1. building a prod bundle'
yarn build

# Copying all files in build/main/lib to the root folder
# This is to enable the correct module export; reference: https://github.com/Microsoft/TypeScript/issues/8305
echo '2. copying the prod bundle to the root scope'
cp -a ./build/main/lib/. ./

# Creating a global symlink of kalimdor
echo '3. creating a global link'
yarn link

# Linking the global kalimdor to local
echo '4. linking kalimdor to local'
yarn link kalimdor

# Running integration test as part of the build
echo '5. run the jest require tests'
yarn test:require
echo 'finished building for prod'
