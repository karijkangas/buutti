#!/usr/bin/env bash

PORT=5000
REGISTRY=127.0.0.1:${PORT}

docker swarm init 2>/dev/null

if [ -z "$(docker service ls | grep registry)" ]
then
  echo Starting local docker registry: ${REGISTRY}
  docker service create --name registry --publish published=${PORT},target=5000 registry:2
fi

docker build -f ${BUUTTI:-.}/docker/Dockerfile -t ${REGISTRY}/buutti-api .
docker push ${REGISTRY}/buutti-api
