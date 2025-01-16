import request from 'supertest';
import { app } from '../index'; // Make sure to export app from server.js
import { Movie, Harddisk, Rental } from '../database/db';
import sequelize from '../database/db';

describe('Movie Rental API', () => {
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

  describe('Harddisk Management', () => {
    test('should create new harddisk', async () => {
      const response = await request(app)
        .post('/api/harddisks')
        .send({
          rfid_code: 'ABC123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body.rfid_code).toBe('ABC123456789');
    });

    test('should not create harddisk with invalid RFID', async () => {
      const response = await request(app)
        .post('/api/harddisks')
        .send({
          rfid_code: 'invalid-rfid'
        });

      expect(response.status).toBe(500);
    });

    test('should link RFID to existing harddisk', async () => {
      const harddisk = await Harddisk.create({});
      
      const response = await request(app)
        .put(`/api/harddisks/${harddisk.id}/rfid`)
        .send({
          rfid_code: 'ABC123456789'
        });

      expect(response.status).toBe(200);
      expect(response.body.rfid_code).toBe('ABC123456789');
    });

    test('should mark harddisk as ready', async () => {
      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789'
      });

      const response = await request(app)
        .put(`/api/harddisks/${harddisk.id}/ready`);

      expect(response.status).toBe(200);
      expect(response.body.ready_for_rental).toBe(true);
    });

    test('should not mark harddisk as not ready when in use', async () => {
      const movie = await Movie.create({
        title: 'Test Movie',
        rent_total: 1
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });

      await Rental.create({
        movie_id: movie.id,
        harddisk_id: harddisk.id,
        movie_index_id: 1
      });

      const response = await request(app)
        .put(`/api/harddisks/${harddisk.id}/not-ready`);

      expect(response.status).toBe(500);
    });
  });

  describe('Movie Management', () => {
    test('should create movie with pending rentals', async () => {
      const response = await request(app)
        .post('/api/movies')
        .send({
          title: 'Inception',
          rent_total: 3
        });

      expect(response.status).toBe(201);
      expect(response.body.movie.title).toBe('Inception');
      expect(response.body.pendingRentals).toHaveLength(3);
    });

    test('should get all harddisks for a movie', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 2
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });

      await Rental.create({
        movie_id: movie.id,
        harddisk_id: harddisk.id,
        movie_index_id: 1
      });

      const response = await request(app)
        .get(`/api/movies/${movie.id}/harddisks`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].harddisk_id).toBe(harddisk.id);
    });

    test('should get rentals by status', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 3
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });

      await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      await Rental.create({
        movie_id: movie.id,
        harddisk_id: harddisk.id,
        movie_index_id: 2
      });

      const pendingResponse = await request(app)
        .get(`/api/movies/${movie.id}/rentals?status=pending`);

      expect(pendingResponse.body).toHaveLength(1);

      const activeResponse = await request(app)
        .get(`/api/movies/${movie.id}/rentals?status=active`);

      expect(activeResponse.body).toHaveLength(1);
    });
  });

  describe('Rental Management', () => {
    test('should assign harddisk to rental', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: true
      });

      const rental = await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      const response = await request(app)
        .put(`/api/rentals/${rental.id}/assign-harddisk`)
        .send({
          harddisk_id: harddisk.id
        });

      expect(response.status).toBe(200);
      expect(response.body.harddisk_id).toBe(harddisk.id);
    });

    test('should not assign unready harddisk', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789',
        ready_for_rental: false
      });

      const rental = await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      const response = await request(app)
        .put(`/api/rentals/${rental.id}/assign-harddisk`)
        .send({
          harddisk_id: harddisk.id
        });

      expect(response.status).toBe(500);
    });

    test('should return rental', async () => {
      const movie = await Movie.create({
        title: 'Inception',
        rent_total: 1
      });

      const harddisk = await Harddisk.create({
        rfid_code: 'BBC123456789',
        ready_for_rental: true,
        availability: true
      });
      const rental = await Rental.create({
        movie_id: movie.id,
        movie_index_id: 1
      });

      let response = await request(app)
        .put(`/api/rentals/${rental.id}/assign-harddisk`)
        .send({
          harddisk_id: harddisk.id
        });

      expect(response.status).toBe(200);
      expect(response.body.harddisk_id).toBe(harddisk.id);
     
      response = await request(app)
        .put(`/api/rentals/${rental.id}/return`);

      expect(response.status).toBe(200);
      expect(response.body.returned_at).toBeTruthy();

      const updatedHarddisk = await Harddisk.findByPk(harddisk.id);
      expect(updatedHarddisk.availability).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent harddisk', async () => {
      const response = await request(app)
        .put('/api/harddisks/999/ready');

      expect(response.status).toBe(404);
    });

    test('should handle non-existent rental', async () => {
      const response = await request(app)
        .put('/api/rentals/999/return');

      expect(response.status).toBe(404);
    });

    test('should handle duplicate RFID codes', async () => {
      await Harddisk.create({
        rfid_code: 'ABC123456789'
      });

      const response = await request(app)
        .post('/api/harddisks')
        .send({
          rfid_code: 'ABC123456789'
        });

      expect(response.status).toBe(500);
    });

    test('should handle invalid movie data', async () => {
      const response = await request(app)
        .post('/api/movies')
        .send({
          title: 'Inception',
          rent_total: -1
        });

      expect(response.status).toBe(500);
    });
  });

  describe('RFID Operations', () => {
    test('should find harddisk by RFID', async () => {
      const harddisk = await Harddisk.create({
        rfid_code: 'ABC123456789'
      });

      const response = await request(app)
        .get(`/api/harddisks/${harddisk.rfid_code}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(harddisk.id);
    });

    test('should handle non-existent RFID', async () => {
      const response = await request(app)
        .get('/api/harddisks/NONEXISTENT123');

      expect(response.status).toBe(404);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk harddisk status updates', async () => {
      const harddisks = await Harddisk.bulkCreate([
        { rfid_code: 'ABC123456789' },
        { rfid_code: 'DEF123456789' }
      ]);

      const responses = await Promise.all(
        harddisks.map(harddisk => 
          request(app).put(`/api/harddisks/${harddisk.id}/ready`)
        )
      );

      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(responses.every(r => r.body.ready_for_rental)).toBe(true);
    });
  });
});