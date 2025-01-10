import { Sequelize, DataTypes } from 'sequelize';

// Specify a physical SQLite file for persistence
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // The file where your database will be stored
});

export const User = sequelize.define('User', {
  username: DataTypes.STRING,
  birthday: DataTypes.DATE,
});

// Sync the model to the database and create the table if it doesn't exist
sequelize.sync()
  .then(() => {
    console.log('Database & table created!');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });