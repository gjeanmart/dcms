FROM ubuntu:18.04
MAINTAINER Gregoire Jeanmart <gregoire.jeanmart@gmail.com>

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y npm git netcat curl jq

####################################################################################################################
# Env


####################################################################################################################
# WORKING DIRECTORY
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

####################################################################################################################
# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

####################################################################################################################
# DEPENDANCIES
COPY package*.json ./
RUN npm install --silent


####################################################################################################################
# COPY SOURCE
COPY ./src/ ./src/
COPY ./public/ ./public/
COPY ./.env ./.env


####################################################################################################################
# RUN
EXPOSE 3000
CMD [ "npm", "start" ]