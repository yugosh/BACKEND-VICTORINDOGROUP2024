require('dotenv').config(); // Load environment variables from .env file

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

module.exports = {
    // url: "mongodb://localhost:27017/db_victorindo2024"
    url: `mongodb+srv://${dbUsername}:${dbPassword}@victorindogroup2024.algbtkj.mongodb.net/db_victorindo2024?retryWrites=true&w=majority&appName=VictorindoGroup2024`
};