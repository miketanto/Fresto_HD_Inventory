import express from 'express';
import { Movie, Harddisk, Rental } from './database/db.js';
import { Op } from 'sequelize';
import cors from 'cors'

export const app = express();

const port = 5000;

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

app.put('/api/harddisks/:id/ready', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByRFID(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    await harddisk.markAsReady();
    res.json(harddisk);
  } catch (error) {
    next(error);
  }
});

app.put('/api/harddisks/:id/not-ready', async (req, res, next) => {
  try {
    const harddisk = await Harddisk.findByPk(req.params.id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk not found' });
    }
    await harddisk.markAsNotReady();
    res.json(harddisk);
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
      harddisk_id: req.body.harddisk_id
    });

    const harddisk = await Harddisk.findByPk(req.body.harddisk_id);
    if (!harddisk) {
      return res.status(404).json({ error: 'Harddisk Not Found' });
    }
    await harddisk.update({
      availability: false
    })
    res.json(rental);
  } catch (error) {
    next(error);
  }
});



app.put('/api/rentals/:id/return', async (req, res, next) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [Harddisk]
    });
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    await rental.update({
      returned_at: new Date()
    });

    if (rental.Harddisk) {
      await rental.Harddisk.update({
        availability: true
      });
    }

    res.json(rental);
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
    const rentals = await Rental.findAll();
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




//----Movies CRUD ---//

// READ ALL - GET /api/movies
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

// READ ONE - GET /api/movies/:id
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

// UPDATE - PUT /api/movies/:id
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

// DELETE - DELETE /api/movies/:id
app.delete('/api/movies/:id', async (req, res, next) => {
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

// Apply error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});