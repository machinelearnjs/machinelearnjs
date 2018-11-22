#!/usr/bin/env bash

# Script to be used when deploying
# Please do not use

echo "1. setup .npmrc"
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

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

echo "2. Setting up git"
# Some reference: https://stackoverflow.com/questions/23391839/clone-private-git-repo-with-dockerfile
mkdir /root/.ssh

# Old approach:
# cp .ssh/id_rsa /root/.ssh
# cp .ssh/id_rsa.pub /root/.ssh

# New approach, which uses environment variables:
echo $SSH_PUB | base64 --decode > /root/.ssh/id_rsa.pub
echo $SSH_PRIV | base64 --decode > /root/.ssh/id_rsa
# This is to avoid ssh "permissions are too open" error: reference=https://stackoverflow.com/questions/9270734/ssh-permissions-are-too-open-error
chmod 400 /root/.ssh/id_rsa

# Creating an empty known_hosts
touch /root/.ssh/known_hosts
# Add github key to avoid fingerprint promt
ssh-keyscan github.com >> /root/.ssh/known_hosts

echo "3. Using /tmp/release as the working directory"
mkdir /tmp/release
cd /tmp/release

echo "4. Cloning the Kalimdor master branch."
echo "You must have everything up-to-date on the master branch"
git clone git@github.com:JasonShin/kalimdorjs.git .
git fetch --all
git checkout v2

echo "5. Setting git meta data"
git config --global user.email "visualbbasic@gmail.com"
git config --global user.name "Jason Shin"
git config --global push.default matching

echo "6. install packages"
yarn

echo "7. Run release-it patch with the given config"
npm install -g release-it@8.0.0
npx release-it ${VERSION} --preRelease=beta -n -c ./scripts/releases/configs/.release-it.json
