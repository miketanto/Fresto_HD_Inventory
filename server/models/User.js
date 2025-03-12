import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../database/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: async (user) => {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    },
  }
});

User.afterSync(async () => {
  try {
    // Check if the default users already exist
    const users = await User.findAll();
    if (users.length === 0) {
      // Create default users
      await User.bulkCreate([
        {
          username: 'freddy',
          password: 'fresto1', // Password will be hashed by the beforeCreate hook
          role: 'admin'
        },
        {
          username: 'tarmo',
          password: 'gilisampeng', // Password will be hashed by the beforeCreate hook
          role: 'user'
        }
      ]);
      console.log('Default users created successfully.');
    } else {
      console.log('Default users already exist.');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
});


export default User;
