#!/usr/bin/env bash

# Starts a container that runs an internal script that runs release-it
# binds any required environment variables

# Handling arg params
while getopts v: option
do
case "${option}"
in
v) VERSION=$OPTARG;;
esac
done

# 1. Version
if [ -z "${VERSION}" ]; then
   echo "Must provide a VERSION; it can be either patch, minor, major, or specific version. Exiting...."
   echo "Find more information about it here: https://webpro.github.io/release-it/#%EF%B8%8F-usage for an instruction"
   exit 1
fi

# 2. NPM TOKEN
if [ -z "${NPM_TOKEN}" ]; then
   echo "Must provide an NPM TOKEN. Exiting...."
   echo "Find more information about it here: https://docs.npmjs.com/getting-started/working_with_tokens for an instruction"
   exit 1
fi

# 3. Github Token
if [ -z "${GITHUB_TOKEN}" ]; then
   echo "Must provide a GITHUB_TOKEN. Exiting...."
   echo "Find more information about it here: https://github.com/settings/tokens for an instruction"
   exit 1
fi

# 4. SSH_PUB
if [ -z "${SSH_PUB}" ]; then
   echo "Must provide a SSH_PUB in base64 format. Exiting...."
   echo "Find more information about it here: https://help.github.com/articles/connecting-to-github-with-ssh/ for an instruction"
   exit 1
fi

# 5. SSH_PRIV
if [ -z "${SSH_PRIV}" ]; then
   echo "Must provide a SSH_PRIV in base64 format. Exiting...."
   echo "Find more information about it here: https://help.github.com/articles/connecting-to-github-with-ssh/ for an instruction"
   exit 1
fi

echo '1. building a kalimdor docker image'
docker build -t kalimdor:latest .

echo '2. Running build-prod.sh in a temporary container'
docker run --rm -it \
-e NPM_TOKEN=${NPM_TOKEN} \
-e GITHUB_TOKEN=${GITHUB_TOKEN} \
-e VERSION=${VERSION} \
-e SSH_PUB=${SSH_PUB} \
-e SSH_PRIV=${SSH_PRIV} \
kalimdor:latest \
'./scripts/releases/docker_internal/release-in-docker.sh'
