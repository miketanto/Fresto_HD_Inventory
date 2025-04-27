import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: './database.sqlite',
// });
console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_HOST, process.env.DB_PORT);
const sequelize = new Sequelize(
  "hd-database",
  "postgres",
  "181202",
  {
    host: "localhost",
    port: "5433",
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected...'))
  .catch(err => console.error('Connection error:', err));

  
// Define Movie model
export const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rent_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  rented_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  returned_count:
  {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'movies',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['title']
    }
  ]
});

// Define Harddisk model
export const Harddisk = sequelize.define('Harddisk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rfid_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isRFIDFormat(value) {
        if (value && !/^[A-Fa-f0-9]{8,24}$/.test(value)) {
          throw new Error('RFID code must be a hexadecimal string between 8 and 24 characters');
        }
      }
    }
  },
  ready_for_rental: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Default to not ready
  },
  availability: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'harddisks',
  timestamps: false,
  hooks: {
    beforeDestroy: async (harddisk) => {
      const rental = await sequelize.models.Rental.findOne({
        where: { harddisk_id: harddisk.id, returned_at: null }
      });
      if (rental) {
        throw new Error('Cannot delete hard disk with ongoing associated rentals');
      }
    },
    beforeCreate: async (harddisk) => {
      if (harddisk.rfid_code) {
        harddisk.rfid_code = harddisk.rfid_code.toUpperCase();
      }
    },
    beforeUpdate: async (harddisk) => {
      if (harddisk.rfid_code) {
        harddisk.rfid_code = harddisk.rfid_code.toUpperCase();
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['rfid_code']
    }
  ]
});

// Add utility methods to Harddisk model
Harddisk.prototype.markAsReady = async function() {
  return this.update({ ready_for_rental: true });
};

Harddisk.prototype.markAsNotReady = async function() {
  if (await this.hasActiveRentals()) {
    throw new Error('Cannot mark harddisk as not ready while it has active rentals');
  }
  return this.update({ ready_for_rental: false });
};

Harddisk.prototype.hasActiveRentals = async function() {
  const activeRental = await Rental.findOne({
    where: {
      harddisk_id: this.id,
      returned_at: null
    }
  });
  return !!activeRental;
};

// Add a method to find harddisk by RFID code
Harddisk.findByRFID = function(rfidCode) {
  return this.findOne({
    where: {
      rfid_code: rfidCode
    }
  });
};

// Add instance method to update RFID
Harddisk.prototype.updateRFID = async function(newRFIDCode) {
  return this.update({
    rfid_code: newRFIDCode
  });
};
// Define Rental model
export const Rental = sequelize.define('Rental', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  harddisk_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'harddisks',
      key: 'id'
    }
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  movie_index_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  comments: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rented_at: {
    type: DataTypes.DATE       // Remove default value
  },
  returned_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'rentals',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'movie_index_id']
    }
  ]
});

Rental.beforeUpdate(async (rental) => {
  if (rental.changed('harddisk_id') && rental.harddisk_id) {
    // Check if rental is already returned
    const currentRental = await Rental.findByPk(rental.id);
    if (currentRental.returned_at) {
      throw new Error('Cannot assign harddisk to returned rental');
    }

    const harddisk = await Harddisk.findByPk(rental.harddisk_id);
    if (!harddisk) {
      throw new Error('Harddisk not found');
    }
    if (!harddisk.availability) {
      throw new Error('Harddisk is not available');
    }
  }
});

Rental.beforeUpdate(async (rental) => {
  if (rental.changed('harddisk_id') && rental.harddisk_id) {
    const harddisk = await Harddisk.findByPk(rental.harddisk_id);
    if (!harddisk) {
      throw new Error('Harddisk not found');
    }
    if (!harddisk.availability) {
      throw new Error('Harddisk is not available');
    }
  }
});

// NEW Hook: Check that rental start cannot occur if harddisk is not ready
Rental.beforeUpdate(async (rental) => {
  if (rental.changed('rented_at') && rental.rented_at) {
    const harddisk = await Harddisk.findByPk(rental.harddisk_id);
    if (!harddisk) {
      throw new Error('Associated harddisk not found');
    }
    if (!harddisk.ready_for_rental) {
      throw new Error('Cannot start rental as harddisk is not ready');
    }
    const movie = await Movie.findByPk(rental.movie_id);
    if (!movie) {
      throw new Error('Associated movie not found');
    }
    movie.rented_count += 1;
    await movie.save();
  }
});


Rental.beforeUpdate(async (rental) => {
    //If successfully rented, we need to update the rented count of the movie
  if(rental.changed('returned_at') && rental.returned_at) {
    //Only can be returned if it is rented
    const movie = await Movie.findByPk(rental.movie_id);
    if (!movie) {
      throw new Error('Associated movie not found');
    }
    //Returned count should not be greater than rented count
    if(movie.returned_count >= movie.rented_count) {
      throw new Error('Returned count should not be greater than rented count');
    }
    movie.returned_count += 1;
    await movie.save();
  }
});

// Add hooks for validation
Rental.beforeCreate(async (rental) => {
  // Check if movie_index_id exceeds rent_total
  const movie = await rental.getMovie();
  if (!movie) throw new Error('Movie not found');
  
  const existingRentalsCount = await Rental.count({
    where: { movie_id: rental.movie_id }
  });
  
  // if (existingRentalsCount >= movie.rent_total) {
  //   throw new Error('Exceeded maximum rentals for this movie');
  // }
  
  // Check for duplicate movie_index_id
  const duplicateRental = await Rental.findOne({
    where: {
      movie_id: rental.movie_id,
      movie_index_id: rental.movie_index_id
    }
  });
  
  if (duplicateRental) {
    throw new Error('Duplicate movie_index_id for this movie');
  }
  if (rental.harddisk_id) {
    const harddisk = await Harddisk.findByPk(rental.harddisk_id);
    if (!harddisk) {
      throw new Error('Harddisk not found');
    }
    if (!harddisk.ready_for_rental) {
      throw new Error('Harddisk is not ready for rental');
    }
    if (!harddisk.availability) {
      throw new Error('Harddisk is not available');
    }
  }
});

// Define associations
Harddisk.hasMany(Rental, {
  foreignKey: 'harddisk_id',
  onDelete: 'RESTRICT'
});
Rental.belongsTo(Harddisk, { foreignKey: 'harddisk_id' });

Movie.hasMany(Rental, {
  foreignKey: 'movie_id',
  onDelete: 'RESTRICT'
});
Rental.belongsTo(Movie, { foreignKey: 'movie_id' });

// Sync all models with the database
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

export default sequelize;