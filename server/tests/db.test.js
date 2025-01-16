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

  describe('Harddisk Management', () => {
    describe('Basic Harddisk Operations', () => {
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

        const hardDisk = await Harddisk.create({
          ready_for_rental: true
        });
        
        await Rental.create({
          movie_id: movie.id,
          harddisk_id: hardDisk.id,
          movie_index_id: 1
        });

        await expect(hardDisk.destroy()).rejects.toThrow();
      });
    });

    describe('RFID Management', () => {
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
            rfid_code: 'invalid-rfid'
          });
        }).rejects.toThrow();
      });
    });

    describe('Rental Readiness', () => {
      let movie;
      
      beforeEach(async () => {
        movie = await Movie.create({
          title: 'Test Movie',
          rent_total: 5
        });
      });

      test('should create harddisk with ready_for_rental as false by default', async () => {
        const harddisk = await Harddisk.create({
          rfid_code: 'ABC123456789'
        });
        expect(harddisk.ready_for_rental).toBe(false);
      });

      test('should allow marking harddisk as ready for rental', async () => {
        const harddisk = await Harddisk.create({
          rfid_code: 'ABC123456789'
        });
        await harddisk.markAsReady();
        expect(harddisk.ready_for_rental).toBe(true);
      });

      test('should not allow marking harddisk as not ready when in use', async () => {
        const harddisk = await Harddisk.create({
          rfid_code: 'ABC123456789',
          ready_for_rental: true
        });

        await Rental.create({
          movie_id: movie.id,
          harddisk_id: harddisk.id,
          movie_index_id: 1
        });

        await expect(harddisk.markAsNotReady())
          .rejects.toThrow('Cannot mark harddisk as not ready while it has active rentals');
      });
    });
  });
  describe('Rental Process', () => {
    let movie;
    let readyHarddisk;
    
    beforeEach(async () => {
      movie = await Movie.create({
        title: 'Inception',
        rent_total: 10
      });
      
      readyHarddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });
    });

    describe('Basic Rental Operations', () => {
      test('should create rental with ready harddisk', async () => {
        const rental = await Rental.create({
          movie_id: movie.id,
          harddisk_id: readyHarddisk.id,
          movie_index_id: 1
        });

        expect(rental.harddisk_id).toBe(readyHarddisk.id);
      });

      test('should not allow rental creation with unready harddisk', async () => {
        const unreadyHarddisk = await Harddisk.create({
          rfid_code: 'DEF123456789'
        });

        await expect(Rental.create({
          movie_id: movie.id,
          harddisk_id: unreadyHarddisk.id,
          movie_index_id: 1
        })).rejects.toThrow('Harddisk is not ready for rental');
      });

      //TODO
      
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

        // Create ready hard disks
        const hardDisks = await Promise.all(
          Array(3).fill(null).map(() => Harddisk.create({
            //rfid_code: `TEST${Math.random().toString(15).substring(7)}`,
            ready_for_rental: true
          }))
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
    });
    
    describe('Rental Updates and Returns', () => {
      test('should update pending rental with ready harddisk', async () => {
        const rental = await Rental.create({
          movie_id: movie.id,
          movie_index_id: 1
        });

        await rental.update({
          harddisk_id: readyHarddisk.id
        });

        expect(rental.harddisk_id).toBe(readyHarddisk.id);
      });

      test('should not allow rental update with unready harddisk', async () => {
        const rental = await Rental.create({
          movie_id: movie.id,
          movie_index_id: 1
        });

        const unreadyHarddisk = await Harddisk.create({
          rfid_code: 'DEF123456789'
        });

        await expect(rental.update({
          harddisk_id: unreadyHarddisk.id
        })).rejects.toThrow('Harddisk is not ready for rental');
      });

      test('should handle batch returns', async () => {
        const hardDisks = await Promise.all(
          Array(3).fill(null).map(() => Harddisk.create({
            //rfid_code: `TEST${Math.random().toString(36).substring(7)}`,
            ready_for_rental: true
          }))
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

        const returnedRentals = await Rental.findAll({
          where: {
            movie_id: movie.id,
            returned_at: { [Op.not]: null }
          }
        });

        expect(returnedRentals).toHaveLength(3);//Accounting for the beforeEach

        const availableHardDisks = await Harddisk.findAll({
          where: { availability: true }
        });

        expect(availableHardDisks).toHaveLength(4);
      });
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

      const hardDisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });

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