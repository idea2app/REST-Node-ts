export const { NODE_ENV, PORT = 8080, DATABASE_URL, APP_SECRET } = process.env;

export const isProduct = NODE_ENV === 'production';
