import express from 'express';
import { Movie, Harddisk, Rental } from './database/db.js';
import { Op } from 'sequelize';
import cors from 'cors'
import {register, login} from './controllers/authController.js';

export const app = express();

const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error'
  });
};

// Harddisk Management Endpoints
app.post('/api/harddisks', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.create({
      rfid_code: req.body.rfid_code // Optional at creation
    });
    res.status(201).json(harddisk);
  } catch (error) {
    next(error);
  }
});


app.get('/api/harddisks/:id/rfid', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

app.put('/api/harddisks/:id/rfid', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByPk(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    await harddisk.updateRFID(req.body.rfid_code);
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

// Update Ready Endpoint: Ensure harddisk is not already ready
app.put('/api/harddisks/:id/ready', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    if (harddisk.ready_for_rental) {
      return res.status(400).json({ error: 'Harddisk already marked as ready' });
    }
    await harddisk.markAsReady();
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

// Update Not-Ready Endpoint: Ensure harddisk is currently ready
app.put('/api/harddisks/:id/not-ready', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByPk(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    if (!harddisk.ready_for_rental) {
      return res.status(400).json({ error: 'Harddisk is already not ready' });
    }
    await harddisk.markAsNotReady();
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

// New endpoint: Get harddisk status including ready, availability, rental association, and return status
app.get('/api/harddisks/:id/status', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    // Find the most recent rental associated with this harddisk
    const rental = await Rental.findOne({
      where: { harddisk_id: harddisk.id },
      order: [['created_at', 'DESC']]
    });
    res.json({
      ready: harddisk.ready_for_rental,       // true if ready, false if not
      availability: harddisk.availability,      // true if available, false if unavailable
      rentalAssociated: !!rental && (!rental.returned_at),               // true if there is a rental record
      returned: rental ? !!rental.returned_at : false // true if rental has been returned
    });
  } catch (error) {
    next(error);
  }
});

// Movie Management Endpoints
app.post('/api/movies', async (req, res, next) => {
  try {
    const movie = await Movie.create({
      title: req.body.title,
      rent_total: req.body.rent_total
    });

    // Create pending rentals
    const pendingRentals = await Promise.all(
      Array(Number(movie.rent_total)).fill(null).map((_, index) => {
        return Rental.create({
          movie_id: movie.id,
          movie_index_id: index + 1
        });
      })
    );

    res.status(201).json({
      movie,
      pendingRentals
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/movies/:id/harddisks', async (req, res, next) => {
  try {
    const rentals = await Rental.findAll({
      where: {
        movie_id: req.params.id,
        harddisk_id: {
          [Op.not]: null
        }
      },
      include: [{
        model: Harddisk,
        attributes: ['id', 'rfid_code', 'availability', 'ready_for_rental']
      }]
    });

    res.json(rentals);
  } catch (error) {
    next(error);
  }
});

// Rental Management Endpoints
app.put('/api/rentals/:id/assign-harddisk', async (req, res, next) => {
  try {
    const rental = await Rental.findByPk(req.params.id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    await rental.update({
      harddisk_id: req.body.harddisk_id,
      comments: req.body.comments
    });
    res.json(rental);
  } catch (error) {
    next(error);
  }
});

app.post('/api/rentals', async (req, res, next) => {
  try {
    const { movie_id, harddisk_id, movie_index_id, comments } = req.body;
    const rental = await Rental.create({
      movie_id,
      harddisk_id,
      movie_index_id,
      comments
    });
    res.status(201).json(rental);
  } catch (error) {
    next(error);
  }
});

// Modified: Use harddisk RFID to return a rental with additional validations
app.put('/api/rentals/:id/return', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    // Find active rental (started but not yet returned)
    const rental = await Rental.findOne({
      where: { 
        harddisk_id: harddisk.id, 
        rented_at: { [Op.not]: null },
        returned_at: { [Op.is]: null }
      },
      include: [Harddisk]
    });
    if (!rental) {
      return res.status(404).json({ error: 'No active rental found for given harddisk' });
    }
    await rental.update({ returned_at: new Date() });
    if (rental.Harddisk) {
      await rental.Harddisk.update({ availability: true, ready_for_rental: false });
    }
    res.json(rental);
  } catch (error) {
    next(error);
  }
});

// Update Rental Start Endpoint: Check if harddisk is ready for rental and rental hasn't been returned
app.put('/api/rentals/:id/start', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    // Find pending rental that hasn't been started or returned
    const rental = await Rental.findOne({
      where: { 
        harddisk_id: harddisk.id, 
        rented_at: { [Op.is]: null },
        returned_at: { [Op.is]: null }
      },
      include: [Harddisk]
    });
    if (!rental) {
      return res.status(404).json({ error: 'No pending rental found for given harddisk that has not been returned' });
    }
    
    // Update rental and mark harddisk unavailable
    await rental.update({ rented_at: new Date() });
    if (rental.harddisk_id) {
      const hd = await Harddisk.findByPk(rental.harddisk_id);
      if (hd) {
        await hd.update({ availability: false });
      }
    }
    res.json(rental);
  } catch (error) {
    console.log(error)
    next(error);
  }
});

// Batch Start Rentals Endpoint
app.put('/api/rentals/batch-start', async (req, res, next) => {
  try {
    const { rentalIds } = req.body;
    if (!Array.isArray(rentalIds) || rentalIds.length === 0) {
      return res.status(400).json({ error: 'Invalid rentalIds. Must be a non-empty array.' });
    }

    const rentals = await Rental.findAll({
      where: {
        id: rentalIds,
        rented_at: { [Op.is]: null },
        returned_at: { [Op.is]: null }
      },
      include: [Harddisk]
    });

    const foundRentalIds = rentals.map(rental => rental.id);
    const notFoundOrInvalidRentals = rentalIds.filter(id => !foundRentalIds.includes(id));

    const updatedRentals = await Promise.all(
      rentals.map(async (rental) => {
        await rental.update({ rented_at: new Date() });
        if (rental.Harddisk) {
          await rental.Harddisk.update({ availability: false });
        }
        return rental;
      })
    );

    res.json({ 
      message: 'Batch process completed.', 
      updatedRentals, 
      notFoundOrInvalidRentals 
    });
  } catch (error) {
    next(error);
  }
});

// Additional Utility Endpoints
app.get('/api/harddisks', async (req, res, next) => {
  try {
    const harddisks = await Harddisk.findAll({
      where: req.query.available ? { availability: true } : {}
    });
    res.json(harddisks);
  } catch (error) {
    next(error);
  }
});

app.get('/api/rentals', async (req, res, next) => {
  try {
    const rentals = await Rental.findAll(
      {
        where: {
          ...(req.query.status === 'pending' && { harddisk_id: null }),
          ...(req.query.status === 'active' && { 
            harddisk_id: { [Op.not]: null },
            returned_at: null
          }),
          ...(req.query.status === 'returned' && { 
            returned_at: { [Op.not]: null }
          })
        },
        include: [{
          model: Harddisk,
          attributes: ['id', 'rfid_code', 'availability', 'ready_for_rental']
        }]
      }
    );
    res.json(rentals);
  } catch (error) {
    next(error);
  }
});

app.get('/api/movies/:id/rentals', async (req, res, next) => {
  try {
    const rentals = await Rental.findAll({
      where: {
        movie_id: req.params.id,
        ...(req.query.status === 'pending' && { harddisk_id: null }),
        ...(req.query.status === 'active' && { 
          harddisk_id: { [Op.not]: null },
          returned_at: null
        }),
        ...(req.query.status === 'returned' && { 
          returned_at: { [Op.not]: null }
        })
      },
      include: [{
        model: Harddisk,
        attributes: ['id', 'rfid_code', 'availability', 'ready_for_rental']
      }]
    });

    res.json(rentals);
  } catch (error) {
    next(error);
  }
});

app.get('/api/harddisks/:rfid', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.rfid);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

// New endpoint: Add a new rental to an existing movie
app.post('/api/movies/:movieId/rentals', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { count = 1, comments } = req.body; // Default count to 1 if not provided

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const lastRental = await Rental.findOne({
      where: { movie_id: movie.id },
      order: [['movie_index_id', 'DESC']]
    });
    const nextIndex = lastRental ? lastRental.movie_index_id + 1 : 1;

    const newRentals = await Promise.all(
      Array.from({ length: count }).map((_, index) =>
        Rental.create({
          movie_id: movie.id,
          movie_index_id: nextIndex + index,
          comments: comments || null
        })
      )
    );

    await movie.increment('rent_total', { by: count });

    res.status(201).json(newRentals);
  } catch (error) {
    next(error);
  }
});


//----Movies CRUD ---//

// READ ALL - GET /movies
app.get('/api/movies', async (req, res, next) => {
  try {
    const movies = await Movie.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

// READ ONE - GET /movies/:id
app.get('/api/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// UPDATE - PUT /movies/:id
app.put('/api/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.update(req.body);
    
    res.json(movie);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Movie title already exists' });
    }
    next(error);
  }
});

// DELETE - DELETE /movies/:id
app.delete('/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// New Auth Endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Apply error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});