# REST Node.ts

[REST][1]ful API service scaffold based on [Node.js][2] & [TypeScript][3]

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)][4]

## Feature

1. HTTP server: [Koa][5]
2. Controller framework: [Routing Controllers][6]
3. Model framework: [Class Transformer][7] & [Class Validator][8]
4. ORM framework: [TypeORM][9]
5. API document: [Swagger][10]
6. Mock API: [OpenAPI backend][11]

## Environment variables

|     Name     |          Usage           |
| :----------: | :----------------------: |
| `APP_SECRET` | encrypt Password & Token |

## Usage

### Development

Execute a command:

```shell
npm run dev
```

or just press <kbd>F5</kbd> key in [VS Code][12].

#### Migration

```shell
npm run upgrade:dev
```

### Deployment

Execute a command:

```shell
npm start
```

#### Migration

```shell
npm run upgrade:pro
```

[1]: https://en.wikipedia.org/wiki/Representational_state_transfer
[2]: https://nodejs.org/
[3]: https://www.typescriptlang.org/
[4]: https://render.com/deploy
[5]: https://koajs.com/
[6]: https://github.com/typestack/routing-controllers
[7]: https://github.com/typestack/class-transformer
[8]: https://github.com/typestack/class-validator
[9]: https://typeorm.io/
[10]: https://swagger.io/
[11]: https://github.com/anttiviljami/openapi-backend
[12]: https://code.visualstudio.com/
