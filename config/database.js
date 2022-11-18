/**
 * @file Manages database connection configuration.
 * @author Fikri Rahmat Nurhidayat
 */

const Sequelize = require("sequelize");

/** Destruct environment variable to get database configuration */
const {
  DB_USERNAME = "postgres",
  DB_PASSWORD = "xWmRRVvwqS8cEaWMKtn1",
  DB_HOST = "containers-us-west-129.railway.app",
  DB_NAME = "railway",
  DB_PORT = "6242",
  DB_URL = "postgresql://postgres:xWmRRVvwqS8cEaWMKtn1@containers-us-west-129.railway.app:6242/railway"
} = process.env;

const db = new Sequelize(DB_URL, {
  define: {
    timestamps: false
  }
})

module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}_dev`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}_test`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}_production`,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
  },
  db
};
