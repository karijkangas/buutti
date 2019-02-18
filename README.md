# Buutti demo

## Architecture and design

Image 1: ![Architecture](/design/image1.svg 'Architecture')

Image 1 outlines the architecture of the demo system. The system is divided into three main components: api, store, and test client. Api implements the REST API using nodejs and expressjs. Store implements a persistent key-value store using redis. Jest apitest suite is used to test the REST API. In development, the api and store components are run inside Docker swarm environment for convenience.

Image 2: ![Design](/design/image2.svg 'Design')

Image 2 outlines the Api component module design. The Api is divided into 7 modules: server, app, api, engine, store, config, and logger. Server and app modules implement the expressjs app; division into two distinct parts helps in unit testing. Api module implements REST API routes. Engine module provides the API functionality, i.e. getToken, getPassword, validatePassword. Store module abstracts away the redis-specific details.

Config module abstracts away the API configuration details by providing default values. It also allows the defaults to be modified using environment variables and/or .env file (dotenv).

Logger module provides a unified interface to http, info, and error logging. Currently, all logging is done only to console.

### User verification

Cookies are used to match the /string GET to /string POST. Each GET sets a new cookie with `token=<uuid>` data. The cookie must be set for matching POST.

```
~/src/buutti$ curl -v -w "\n" http://127.0.0.1:3000/string
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 3000 (#0)
> GET /string HTTP/1.1
> Host: 127.0.0.1:3000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Set-Cookie: token=479a5e72-625d-4c81-9982-1030946bc63e; Path=/string
< Content-Type: application/json; charset=utf-8
< Content-Length: 40
< ETag: W/"28-MFSMWXpjrIdF8yseUKKjhsc07Tw"
< Date: Mon, 18 Feb 2019 19:05:55 GMT
< Connection: keep-alive
<
* Connection #0 to host 127.0.0.1 left intact
{"data":"{ch4u-qv3wN_38bzSg+m}~7-3c4~C"}
~/src/buutti$
```

### Secret creation, storage, and TTL

Random strings are generated using randomatic password generator. Secrets are stored to redis, with time-to-live defined by PASSWORD_TTL in config module.

### Unit tests and test client

Unit tests (in `src/__tests__`) are implemented using Jest. Jest test suite (in `/apitest/`) can be used to test the REST API. Lint, prettier, and unit tests are run automatically at git commit.

## Instructions

Install node, npm, docker.

```
# initialize
npm install                 # install npm modules
docker swarm init           # start swarm
./bin/dev-build.sh          # start local registry, build docker image
./bin/dev-start.sh          # start buutti swarm

docker service logs buutti_api --follow  # view api logs

# test
npm test                    # run unit tests
npm run coverage            # run unit test coverage
npm run apitest             # run apitest

# inspect redis status
docker container ls         # get redis container id
docker container exec <redis container id> redis-cli keys "*"
docker container exec <redis container id> redis-cli FLUSHALL
docker container exec <redis container id> redis-cli keys "*"

curl -v http://127.0.0.1:3000/string

docker container exec <redis container id> redis-cli keys "*"
docker container exec <redis container id> redis-cli ttl <token>

# cleanup
docker stack rm buutti      # stop stack
docker service rm registry  # stop local registry
docker swarm leave --force  # stop swarm

docker volume rm buutti_redis-data registry
docker system prune -a
```

_NOTE_: Above instructions only tested on MacOS; they probably work also in Linux.

---

## Original assignment: Javascript backend developer task

Build an API server that has two endpoints:

1. /string GET

- sends a response with a random string of length 8-32 characters long

2. /string POST

- takes in a string and responds “OK” or “NOK” depending on if the encrypted string is correctly encrypted

Then build a testing client that first gets a string from this api server, encrypts this string and sends it back to the server. The server should delete the encrypted string when correctly encrypted version is returned. The server should also delete the encrypted string if it hasn’t been deleted within 15 minutes.

Use some form of verification that the same user that gets the string also sends the encrypted string back.

Also implement a few test cases that verifies the functionality.
Implement everything on your local computer, and for storing the encrypted string any method is valid. Use the BCRYPT method for encryption.

Evaluation criteria:

- Design
- Structure
- Use of language features
- Clarity of implementation
- Error checking
- Comments (is the code self documenting)
- Testability
- Documentation
- Usability
