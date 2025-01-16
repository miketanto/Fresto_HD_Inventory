import { Movie, Harddisk, Rental } from '../database/db';
import sequelize from '../database/db';
import { Op } from 'sequelize';

describe('Movie Rental System', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Rental.destroy({ where: {} });
    await Movie.destroy({ where: {} });
    await Harddisk.destroy({ where: {} });
  });

  describe('Harddisk RFID Management', () => {
    test('should create harddisk with RFID code', async () => {
      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789'
      });
      expect(harddisk.rfid_code).toBe('ABC123456789');
    });
  
    test('should not allow duplicate RFID codes', async () => {
      await Harddisk.create({
        rfid_code: 'ABC123456789'
      });
  
      await expect(async () => {
        await Harddisk.create({
          rfid_code: 'ABC123456789'
        });
      }).rejects.toThrow();
    });
  
    test('should find harddisk by RFID code', async () => {
      const created = await Harddisk.create({
        rfid_code: 'ABC123456789'
      });
  
      const found = await Harddisk.findByRFID('ABC123456789');
      expect(found.id).toBe(created.id);
    });
  
    test('should update RFID code', async () => {
      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789'
      });
  
      await harddisk.updateRFID('DEF987654321');
      expect(harddisk.rfid_code).toBe('DEF987654321');
    });
  
    test('should validate RFID format', async () => {
      await expect(async () => {
        await Harddisk.create({
          rfid_code: 'invalid-rfid'  // Invalid format
        });
      }).rejects.toThrow();
    });
  });
  
  describe('Movie Management', () => {
    test('should create a movie with valid details', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 100
      });

      expect(movie.title).toBe('Inception');
      expect(movie.rent_total).toBe(100);
      expect(movie.created_at).toBeTruthy();
    });
    
    /*Needed*/
    test('should not create a movie with invalid rent_total', async () => {
      await expect(Movie.create({
        title: 'Inception',
        rent_total: -1
      })).rejects.toThrow();
    });
    

    test('should update movie details', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 100
      });

      await movie.update({
        rent_total: 150
      });

      expect(movie.rent_total).toBe(150);
    });

    test('should track total available copies', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 100
      });

      const availableCount = await Rental.count({
        where: {
          movie_id: movie.id,
          harddisk_id: { [Op.not]: null },
          returned_at: null
        }
      });

      expect(availableCount).toBe(0);
    });
  });

  describe('Hard Disk Management', () => {
    test('should create hard disk with default availability', async () => {
      const hardDisk = await Harddisk.create({});
      expect(hardDisk.availability).toBe(true);
    });

    test('should track hard disk status changes', async () => {
      const hardDisk = await Harddisk.create({});
      await hardDisk.update({ availability: false });
      
      const updatedHardDisk = await Harddisk.findByPk(hardDisk.id);
      expect(updatedHardDisk.availability).toBe(false);
    });

    test('should not allow deletion of assigned hard disk', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const hardDisk = await Harddisk.create({});
      
      await Rental.create({
        movie_id: movie.id,
        harddisk_id: hardDisk.id,
        movie_index_id: 1
      });

      await expect(hardDisk.destroy()).rejects.toThrow();
    });
  });

  describe('Rental Process', () => {
    let movie;
    
    beforeEach(async () => {
      movie = await Movie.create({
        title: 'Inception',
        rent_total: 10
      });
    });

    /*test('should create bulk pending rentals', async () => {
      const rentals = await Promise.all(
        Array(10).fill(null).map((_, index) => {
          return Rental.create({
            movie_id: movie.id,
            movie_index_id: index + 1,
            rented_at: new Date()
          });
        })
      );

      expect(rentals).toHaveLength(10);
      expect(rentals.every(r => r.harddisk_id === null)).toBe(true);
    });*/

    test('should assign hard disks in sequential order', async () => {
      // Create pending rentals
      await Promise.all(
        Array(3).fill(null).map((_, index) => {
          return Rental.create({
            movie_id: movie.id,
            movie_index_id: index + 1,
            rented_at: new Date()
          });
        })
      );

      // Create hard disks
      const hardDisks = await Promise.all(
        Array(3).fill(null).map(() => Harddisk.create({}))
      );

      // Assign sequentially
      for (let i = 0; i < 3; i++) {
        const rental = await Rental.findOne({
          where: {
            movie_id: movie.id,
            harddisk_id: null,
            movie_index_id: i + 1
          }
        });

        await rental.update({ harddisk_id: hardDisks[i].id });
      }

      // Verify sequential assignment
      const assignedRentals = await Rental.findAll({
        where: { movie_id: movie.id },
        order: [['movie_index_id', 'ASC']]
      });

      expect(assignedRentals[0].harddisk_id).toBe(hardDisks[0].id);
      expect(assignedRentals[1].harddisk_id).toBe(hardDisks[1].id);
      expect(assignedRentals[2].harddisk_id).toBe(hardDisks[2].id);
    });

    test('should handle batch returns', async () => {
      // Setup: Create rentals and assign hard disks
      const hardDisks = await Promise.all(
        Array(3).fill(null).map(() => Harddisk.create({}))
      );

      const rentals = await Promise.all(
        Array(3).fill(null).map((_, index) => {
          return Rental.create({
            movie_id: movie.id,
            harddisk_id: hardDisks[index].id,
            movie_index_id: index + 1,
            rented_at: new Date()
          });
        })
      );

      // Batch return
      await Promise.all(
        rentals.map(rental => 
          rental.update({ returned_at: new Date() })
        )
      );

      await Promise.all(
        hardDisks.map(hardDisk =>
          hardDisk.update({ availability: true })
        )
      );

      // Verify returns
      const returnedRentals = await Rental.findAll({
        where: {
          movie_id: movie.id,
          returned_at: { [Op.not]: null }
        }
      });

      expect(returnedRentals).toHaveLength(3);

      const availableHardDisks = await Harddisk.findAll({
        where: { availability: true }
      });

      expect(availableHardDisks).toHaveLength(3);
    });
  });

  describe('Business Rules and Constraints', () => {
    test('should not allow duplicate movie_index_id for same movie', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      await expect(Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      })).rejects.toThrow();
    });

    test('should not exceed movie rent_total', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      await expect(Rental.create({
        movie_id: movie.id,
        movie_index_id: 2
      })).rejects.toThrow();
    });

    test('should handle concurrent rental operations', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const hardDisk = await Harddisk.create({});

      // Simulate concurrent operations
      const operations = [
        Rental.create({
          movie_id: movie.id,
          harddisk_id: hardDisk.id,
          movie_index_id: 1
        }),
        Rental.create({
          movie_id: movie.id,
          harddisk_id: hardDisk.id,
          movie_index_id: 1
        })
      ];

      await expect(Promise.all(operations)).rejects.toThrow();
    });
  });

  describe('Reporting and Analytics', () => {
    test('should track rental statistics', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 5
      });

      // Create some rentals
      await Promise.all(
        Array(5).fill(null).map((_, index) => {
          return Rental.create({
            movie_id: movie.id,
            movie_index_id: index + 1,
            rented_at: new Date(Date.now() - 86400000) // 1 day ago
          });
        })
      );

      // Return some rentals
      const rentalsToReturn = await Rental.findAll({
        where: { movie_id: movie.id },
        limit: 2
      });

      await Promise.all(
        rentalsToReturn.map(rental =>
          rental.update({ returned_at: new Date() })
        )
      );

      // Get statistics
      const totalRentals = await Rental.count({
        where: { movie_id: movie.id }
      });

      const activeRentals = await Rental.count({
        where: {
          movie_id: movie.id,
          returned_at: null
        }
      });

      const returnedRentals = await Rental.count({
        where: {
          movie_id: movie.id,
          returned_at: { [Op.not]: null }
        }
      });

      expect(totalRentals).toBe(5);
      expect(activeRentals).toBe(3);
      expect(returnedRentals).toBe(2);
    });

    test('should calculate rental duration', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const rental = await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1,
        rented_at: new Date(Date.now() - 86400000) // 1 day ago
      });

      await rental.update({
        returned_at: new Date()
      });

      const duration = rental.returned_at - new Date(rental.rented_at);
      expect(duration).toBeGreaterThan(86000000); // Approximately 1 day
    });
  });
});