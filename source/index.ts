import Koa from "koa";

const { PORT = 8080 } = process.env;

const HOST = `http://localhost:${PORT}`,
  app = new Koa();

console.time("HTTP boot");

app.listen(PORT, () => {
  console.log(`
HTTP served at ${HOST}
`);
  console.timeEnd("HTTP boot");
});
