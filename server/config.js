module.exports = {
  database: {
    host: 'localhost',
    port: 3306,
    database: 'texas_holdem_ai',
    username: 'root',
    password: 'rootpassword', // 请修改为你的MySQL密码
    dialect: 'mysql'
  },
  openai: {
    apiKey: 'your_openai_api_key' // 请修改为你的OpenAI API密钥
  },
  google: {
    apiKey: 'AIzaSyDbXVi3R2i5lxmrR_Xr2vpNMu-t9NKvRD4'
  },
  server: {
    port: 3001,
    env: 'development'
  }
};