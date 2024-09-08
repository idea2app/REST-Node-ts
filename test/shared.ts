import 'dotenv/config';
import { HTTPClient } from 'koajax';

export const { PORT = 8080, GITHUB_PAT } = process.env;

export const client = new HTTPClient({
    baseURI: `http://127.0.0.1:${PORT}`,
    responseType: 'json'
});

export const header = { Authorization: `Bearer ${GITHUB_PAT}` };
