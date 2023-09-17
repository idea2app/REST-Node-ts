# REST Node.ts

[REST][1]ful API service scaffold based on [Node.js][2] & [TypeScript][3]

[![Deploy to Production environment](https://github.com/idea2app/REST-Node-ts/actions/workflows/deploy-production.yml/badge.svg)][4]

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)][5]

## Feature

1. HTTP server: [Koa][6]
2. Controller framework: [Routing Controllers][7]
3. Model framework: [Class Transformer][8] & [Class Validator][9]
4. ORM framework: [TypeORM][10]
5. API document: [Swagger][11]
6. Mock API: [OpenAPI backend][12]

## API Usage

-   Entry: http://localhost:8080/
-   Document: http://localhost:8080/docs/
-   Schema: http://localhost:8080/docs/spec/

### Type package

#### Sign in GitHub packages with NPM

1. Generate a [PAT][13] with `read:packages` authorization
2. Run Sign-in command in your terminal:

```shell
npm login --scope=@your-org --registry=https://npm.pkg.github.com
```

#### Installation

```shell
npm i pnpm -g

pnpm i @your-org/rest-node-ts
```

## Environment variables

|      Name      |            Usage             |
| :------------: | :--------------------------: |
|  `APP_SECRET`  |   encrypt Password & Token   |
| `DATABASE_URL` | PostgreSQL connection string |

## Development

### Installation

```shell
npm i pnpm -g
pnpm i
```

### Start Development environment

```shell
pnpm dev
```

or just press <kbd>F5</kbd> key in [VS Code][14].

### Migration

```shell
pnpm upgrade:dev
```

## Deployment

### Start Production environment

```shell
npm start
```

### Migration

```shell
pnpm upgrade:pro
```

### Docker

```shell
pnpm pack-image
pnpm container
```

## Releasing

### Deploy Application

```shell
git checkout master
git tag v0.6.0  # this version tag comes from ./package.json
git push origin master --tags
```

### Publish Type Package

```shell
git checkout master
git tag type-v0.6.0  # this version tag comes from ./type/package.json
git push origin master --tags
```

[1]: https://en.wikipedia.org/wiki/Representational_state_transfer
[2]: https://nodejs.org/
[3]: https://www.typescriptlang.org/
[4]: https://github.com/idea2app/REST-Node-ts/actions/workflows/deploy-production.yml
[5]: https://render.com/deploy
[6]: https://koajs.com/
[7]: https://github.com/typestack/routing-controllers
[8]: https://github.com/typestack/class-transformer
[9]: https://github.com/typestack/class-validator
[10]: https://typeorm.io/
[11]: https://swagger.io/
[12]: https://github.com/anttiviljami/openapi-backend
[13]: https://github.com/settings/tokens
[14]: https://code.visualstudio.com/
