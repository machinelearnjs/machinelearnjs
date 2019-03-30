FROM node:8.15.1-stretch
MAINTAINER Jason Shin <visualbbasic@gmail.com>

# System Deps
RUN apt-get update -y
RUN apt-get clean

ENV CORE /home/node/app
RUN mkdir $CORE
RUN echo $CORE
WORKDIR $CORE

RUN git init
# Install baseline cache
COPY ./package.json $CORE
COPY ./yarn.lock $CORE
RUN yarn

RUN yarn global add typescript

# Finally add remaining project source code to the docker container
ADD . $CORE

CMD ["yarn", "start"]
