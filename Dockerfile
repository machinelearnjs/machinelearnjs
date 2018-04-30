FROM node:8.4

USER node

ENV CORE /home/node/app
RUN mkdir $CORE
RUN echo $CORE
WORKDIR $CORE

# Production code requirements
ADD . $CORE

# Install baseline cache
COPY ./package.json ./yarn.lock /tmp/
RUN cd /tmp && yarn
RUN cp -a /tmp/node_modules $CORE

WORKDIR $CORE

RUN yarn global add typescript

CMD ["yarn", "start"]
