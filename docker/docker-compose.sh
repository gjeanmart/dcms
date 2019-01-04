#!/bin/bash

echo "removing old containers"
docker-compose down
[ $? -eq 0 ] || exit $?;

echo "Start"
docker-compose `if [ ! -z $1 ]; then echo "-f docker-compose-$1.yml"; fi` up --build
[ $? -eq 0 ] || exit $?;

trap "docker-compose kill" INT
