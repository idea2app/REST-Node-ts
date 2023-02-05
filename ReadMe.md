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

## Environment variables

|      Name      |            Usage             |
| :------------: | :--------------------------: |
|  `APP_SECRET`  |   encrypt Password & Token   |
| `DATABASE_URL` | PostgreSQL connection string |

## Usage

### Development

Execute a command:

```shell
npm i pnpm -g
pnpm dev
```

or just press <kbd>F5</kbd> key in [VS Code][13].

#### Migration

```shell
pnpm upgrade:dev
```

### Deployment

Execute a command:

```shell
npm start
```

#### Migration

```shell
pnpm upgrade:pro
```

#### Docker

```shell
pnpm pack-image
pnpm container
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
[13]: https://code.visualstudio.com/
