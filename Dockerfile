FROM node:8.9.4
MAINTAINER Jason Shin <visualbbasic@gmail.com>

# System Deps
RUN apt-get update -y
RUN apt-get install tmux -y

ENV CORE /home/node/app
RUN mkdir $CORE
RUN echo $CORE
WORKDIR $CORE

RUN git init
# Install baseline cache
COPY ./package.json $CORE
COPY ./yarn.lock $CORE
RUN yarn

# Finally add remaining project source code to the docker container
ADD . $CORE

RUN yarn global add typescript

CMD ["yarn", "start"]
