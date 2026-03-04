# DonkedIn

> **"Six Degrees of Separation" for competitive TF2 players**

DonkedIn is a web application that visualizes the social graph between
competitive [Team Fortress 2](https://www.teamfortress.com/) players based on
shared team membership across two major leagues: **[RGL.gg](https://rgl.gg)**
and **[ETF2L](https://etf2l.org)**.

Enter any two players and Donkedin will find the shortest path connecting them
through the teams they've played on. Like LinkedIn for TF2!

## Features

- **Path finding:** find the shortest connection between any two players via
  shared team history
- **Interactive graph viewer:** explore connections with a force-directed
  [Cytoscape.js](https://js.cytoscape.org/) graph (fCOSE / Cola layouts)
- **Multi-league support:** aggregates data from both RGL.gg and ETF2L
- **Graph database backend:** powered by [Neo4j](https://neo4j.com/) with the
  Graph Data Science plugin for efficient shortest-path queries

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Nuxt 4](https://nuxt.com) / [Vue 3](https://vuejs.org) |
| State management | [Pinia](https://pinia.vuejs.org) |
| Graph visualization | [Cytoscape.js](https://js.cytoscape.org) (fCOSE, Cola) |
| Backend / API | Nuxt server routes (Nitro) |
| Graph database | [Neo4j 5](https://neo4j.com) + Graph Data Science plugin |
| Language | TypeScript |
| Linting / Formatting | ESLint + Prettier + Husky |
| Testing | [Vitest](https://vitest.dev) |

## Prerequisites

- [Node.js](https://nodejs.org/) v25
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & Docker Compose (for the recommended setup)
- A [Steam Web API key](https://steamcommunity.com/dev/apikey) (for fetching player avatars)

## Building and Running Locally

### Docker Compose

This spins up the Nuxt app **and** a Neo4j instance together.

Clone the repo and navigate into it:

```bash
git clone https://github.com/HumanoidSandvichDispenser/donkedin.git
cd donkedin
```

Set your Steam API key as an environment variable, or edit `.env` to include
it:

```bash
export STEAM_API_KEY=your_steam_api_key_here
```

Start the application with Docker Compose:

```bash
docker compose up
```
