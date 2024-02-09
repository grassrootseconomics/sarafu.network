## Sarafu Network

[![Here Be Dragons](https://img.shields.io/badge/Here%20be%20Dragons-%F0%9F%90%89-success&color=white&)](https://en.wikipedia.org/wiki/Here_be_dragons)

Sarafu Network is the premier dApp for interacting with CAV's (Community Asset Vouchers).

> Try it on https://sarafu.network

## Features

- Create customized CAV's
- Client-side wallet interface to interact with the Celo blockchain including sending transactions
- Create and connect `Paper Wallets`
- Transaction explorer for CAV's
- View detailed stats for all CAV's in the Sarafu Network realm

## Development

To get started, make sure you have the following prerequisites installed:

- Git
- Node.js (>= 20.0.0)
- Docker (>= 24.0.0)\
- [tern](https://github.com/jackc/tern)

Clone the repo and `cd` it:

```bash
git clone https://github.com/grassrootseconomics/sarafu.network.git && cd sarafu.network
```

Install NPM dependencies:

```bash
npm i
```

Start postgres via Docker Compose:

```bash
cd dev
docker compose up
```

Update `env.local` file:

```bash
cp env.local.example env.local
# Update any value that you would like to change
```

Prepare DB:

In another folder, e.g. `/tmp`, clone `cic-graph`

```bash
git clone https://github.com/grassrootseconomics/cic-graph.git
cd migrations
PG_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cic_graph" tern migrate
```

Note: You can use any SQL migration tool to run the migrations.

```bash
# You can run the SQL queries with your tool of choice
psql -h localhost -U postgres
# Password postgres
\c cic_graph
# Run the queuries
```

Start the development server:

```bash
npm run dev
```

### Restore from a cic-graph snapshot

If you have access to a redacted snapshot, you can restore the db with the command:

```bash
docker run -i -v dev_sarafu-network-pg:/volume --rm loomchild/volume-backup restore < graph.tar.bz2
```

## License

[AGPL-3.0](LICENSE)
