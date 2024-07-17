# REST-Node-ts

[REST][1]ful API service scaffold based on [Node.js][2] & [TypeScript][3]

[![Deploy to Production environment](https://github.com/idea2app/REST-Node-ts/actions/workflows/deploy-production.yml/badge.svg)][4]

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)][5]

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][6]
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][7]

## Feature

1. HTTP server: [Koa][8]
2. Controller framework: [Routing Controllers][9]
3. Model framework: [Class Transformer][10] & [Class Validator][11]
4. ORM framework: [TypeORM][12]
5. API document: [Swagger][13]
6. Mock API: [OpenAPI backend][14]

## Best practice

1.  Install GitHub apps in your organization or account:

    1.  [Probot settings][15]: set up Issue labels & Pull Request rules
    2.  [PR badge][16]: set up Online [VS Code][17] editor entries in Pull Request description

2.  Click the **[<kbd>Use this template</kbd>][18] button** on the top of this GitHub repository's home page, then create your own repository in the app-installed namespace above

3.  Click the **[<kbd>Open in GitHub codespaces</kbd>][8] button** on the top of ReadMe file, then an **online VS Code development environment** will be started immediately

4.  Recommend to add a [Notification step in GitHub actions][19] for your Team IM app

5.  Remind the PMs & users of your product to submit **Feature/Enhancement** requests or **Bug** reports with [Issue forms][20] instead of IM messages or Mobile Phone calls

6.  Collect all these issues into [Project kanbans][21], then create **Pull requests** & add `closes #issue_number` into its description for automation

## API Usage

-   Entry: http://localhost:8080/
-   Document: http://localhost:8080/docs/
-   Schema: http://localhost:8080/docs/spec/

### Type package

#### Sign in GitHub packages with NPM

1. Generate a [PAT][22] with `read:packages` authorization
2. Run Sign-in command in your terminal, and use PAT as password:

```shell
npm login --scope=@your-org --registry=https://npm.pkg.github.com
```

#### Installation

```shell
npm i pnpm -g

pnpm i @idea2app/rest-node-ts -D
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

or just press <kbd>F5</kbd> key in [VS Code][17].

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
git tag v0.7.0  # this version tag comes from ./package.json
git push origin master --tags
```

### Publish Type Package

```shell
git checkout master
git tag type-v0.7.0  # this version tag comes from ./type/package.json
git push origin master --tags
```

[1]: https://en.wikipedia.org/wiki/Representational_state_transfer
[2]: https://nodejs.org/
[3]: https://www.typescriptlang.org/
[4]: https://github.com/idea2app/REST-Node-ts/actions/workflows/deploy-production.yml
[5]: https://render.com/deploy
[6]: https://codespaces.new/idea2app/REST-Node-ts
[7]: https://gitpod.io/?autostart=true#https://github.com/idea2app/REST-Node-ts
[8]: https://koajs.com/
[9]: https://github.com/typestack/routing-controllers
[10]: https://github.com/typestack/class-transformer
[11]: https://github.com/typestack/class-validator
[12]: https://typeorm.io/
[13]: https://swagger.io/
[14]: https://github.com/anttiviljami/openapi-backend
[15]: https://github.com/apps/settings
[16]: https://pullrequestbadge.com/
[17]: https://code.visualstudio.com/
[18]: https://github.com/new?template_name=REST-Node-ts&template_owner=idea2app
[19]: https://github.com/kaiyuanshe/kaiyuanshe.github.io/blob/bb4675a56bf1d6b207231313da5ed0af7cf0ebd6/.github/workflows/pull-request.yml#L32-L56
[20]: https://github.com/idea2app/REST-Node-ts/issues/new/choose
[21]: https://github.com/idea2app/REST-Node-ts/projects
[22]: https://github.com/settings/tokens
