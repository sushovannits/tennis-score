# graphql-text-search

A graphql server for providing tennis score keeping service
<!-- toc -->
- [Overview](#overview)
- [System Requirements](#system-requirements)
- [How To Use](#how-to-use)
- [Implementation Details](#implementation-details)
<!-- tocstop -->

## Overview
This is implementation of a graphql + apollo powered server to provide tennis scoring capabilities

## System Requirements
- node
- yarn/ npm

## How To Use
- `yarn install`
- `yarn run start`
- Call the endpoint to create a game:
  ```
  curl --request POST \
  --url http://localhost:4000/ \
  --header 'content-type: application/json' \
  --data '{"query":"mutation {\n  createGame(game: {name: \"test game\", players: {p1:\"fed\", p2: \"nad\"}})\n}"}'
  ```
- Search for score for a given gameId:
  ```
  curl --request POST \
    --url http://localhost:4000/ \
    --header 'content-type: application/json' \
    --data '{"query":"{\n  score(gameId: 0) {\n    gameId,\n    name,\n    sets {\n      p1,\n      p2\n    }\n    currentGame {\n      p1,\n      p2\n    },\n    winner\n  }\n}"}'
  ```
- Record point:
  ```
  curl --request POST \
  --url http://localhost:4000/ \
  --header 'content-type: application/json' \
  --data '{"query":"mutation {\n  recordPoint(point: {gameId: 0, point: \"p2\"}) {\n    gameId,\n    name,\n    sets {\n      p1,\n      p2\n    }\n    currentGame {\n      p1,\n      p2\n    }\n  }\n}"}'
  ```
- Run test
  ```
  yarn run test
  ```
## Implementation Details
- Have used apollo with graphql
- Data store is in memory and just a map
- This is just the server code. For frontend/client code would use apollo-client with apollo-links for handling retries, etc.
- Points are 0, 15, 30, Deuce, Advantage
