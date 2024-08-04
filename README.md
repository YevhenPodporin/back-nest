## Description

[Nest] chat application

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Migrations generate for windows
```bash
"typeorm:generate-win": "npx typeorm-ts-node-commonjs migration:generate -d ./ormconfig.ts src/database/migrations/%npm_config_name%",
```

### Migrations generate default
```bash
"typeorm:generate": "npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d ./ormconfig.ts src/database/migrations/$npm_config_name"
```

### Swagger usage
In order to authorize and use api you should log in:
http://localhost:4000/api/swagger#/Authenticate/AuthController_login

Cookies will be automatically added

