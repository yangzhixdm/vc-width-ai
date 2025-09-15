module.exports = {
  database: {
    host: 'localhost',
    port: 3306,
    database: 'texas_holdem_ai',
    username: 'root',
    password: 'rootpassword',
    dialect: 'mysql'
  },
  openai: {
    apiKey: 'your_openai_api_key'
  },
  server: {
    port: 3001,
    env: 'development'
  }
};
