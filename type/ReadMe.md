# Open Hackathon Platform - Type package

## Usage

### 1. Sign in GitHub packages with NPM

1. Generate a [PAT][1] with `read:packages` authorization
2. Run Sign-in command in your terminal, and use PAT as password:
    ```shell
    npm login --scope=@idea2app --registry=https://npm.pkg.github.com
    ```

### 2. Installation

```shell
npm i pnpm -g

pnpm i @idea2app/rest-node-ts -D
```

[1]: https://github.com/settings/tokens
