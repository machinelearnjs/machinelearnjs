FROM node:22-alpine

LABEL maintainer="Jason Shin <visualbbasic@gmail.com>"

# Set working directory
ENV CORE=/home/node/app
WORKDIR $CORE

# Create app directory
RUN mkdir -p $CORE

# Install OS dependencies (Alpine uses apk, not apt-get)
RUN apk add --no-cache git bash

# Copy package files first to leverage Docker layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Start the app
CMD ["yarn", "start"]