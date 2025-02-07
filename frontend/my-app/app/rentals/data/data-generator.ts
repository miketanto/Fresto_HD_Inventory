import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { Movie, Harddisk, Rental } from "./schema";

// Function to generate a single movie record
const generateMovie = (id: number): Movie => ({
  id,
  title: faker.lorem.words(3),
  rent_total: faker.number.int({ min: 1, max: 10 }),
  created_at: faker.date.past(),
});

// Function to generate a single harddisk record
const generateHarddisk = (id: number): Harddisk => ({
  id,
  rfid_code: faker.datatype.boolean() ? faker.string.hexadecimal({ length: 16 }) : null,
  ready_for_rental: faker.datatype.boolean(),
  availability: faker.datatype.boolean(),
  created_at: faker.date.past().toISOString(),
});

// Function to generate a single rental record
const generateRental = (id: number, harddiskId: number, movieId: number): Rental => ({
  id,
  harddisk_id: harddiskId,
  movie_id: movieId,
  movie_index_id: faker.number.int({ min: 1, max: 10 }),
  rented_at: faker.date.past().toISOString(),
  returned_at: faker.datatype.boolean() ? faker.date.past().toISOString() : null, // Randomly return some rentals
});

// Generate 100 mock movies
const mockMovies: Movie[] = Array.from({ length: 100 }, (_, index) => generateMovie(index + 1));

// Generate 100 mock harddisks
const mockHarddisks: Harddisk[] = Array.from({ length: 100 }, (_, index) => generateHarddisk(index + 1));

// Generate 100 mock rentals
const mockRentals: Rental[] = Array.from({ length: 100 }, (_, index) =>
  generateRental(index + 1, mockHarddisks[index].id, mockMovies[index].id)
);

// Write the mock data to JSON files
fs.writeFileSync(
  path.join(__dirname, "movies.json"),
  JSON.stringify(mockMovies, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, "harddisks.json"),
  JSON.stringify(mockHarddisks, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, "rentals.json"),
  JSON.stringify(mockRentals, null, 2)
);

console.log("✅ Mock data generated.");