FROM ubuntu:18.04
MAINTAINER Gregoire Jeanmart <gregoire.jeanmart@gmail.com>

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y nodejs npm git netcat curl jq
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

####################################################################################################################
# Env
ENV HOST "0.0.0.0"
ENV PORT "8080"

####################################################################################################################
# WORKING DIRECTORY
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

####################################################################################################################
# DEPENDANCIES
COPY package*.json ./
RUN npm install --silent


####################################################################################################################
# COPY SOURCE
COPY ./index.js ./index.js
COPY ./helpers/ ./helpers/



####################################################################################################################
# RUN
EXPOSE 8080
CMD [ "npm", "start" ]
