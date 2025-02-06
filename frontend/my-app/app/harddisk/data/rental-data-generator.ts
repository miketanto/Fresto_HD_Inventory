import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { Rental, Harddisk } from "./schema";

// Function to generate a single harddisk record
const generateHarddisk = (id: number): Harddisk => ({
  id,
  rfid_code: faker.datatype.boolean() ? faker.string.hexadecimal({ length: 16 }) : null,
  ready_for_rental: faker.datatype.boolean(),
  availability: faker.datatype.boolean(),
  created_at: faker.date.past().toISOString(),
});

// Function to generate a single rental record
const generateRental = (id: number): Rental => {
  const hasHarddisk = faker.datatype.boolean(); // Randomly assign a harddisk
  const harddisk = hasHarddisk ? generateHarddisk(id) : undefined;

  return {
    id,
    harddisk_id: harddisk ? harddisk.id : null,
    movie_id: faker.number.int({ min: 1, max: 100 }), // Random movie ID
    movie_index_id: faker.number.int({ min: 1, max: 10 }), // Random movie index
    rented_at: faker.date.past().toISOString(),
    returned_at: faker.datatype.boolean() ? faker.date.past().toISOString() : null, // Randomly return some rentals
    Harddisk: harddisk,
  };
};

// Generate 100 mock rental items
const mockRentalData: Rental[] = Array.from({ length: 100 }, (_, index) =>
  generateRental(index + 1)
);

// Write the mock rental data to a JSON file
fs.writeFileSync(
  path.join(__dirname, "rentals.json"),
  JSON.stringify(mockRentalData, null, 2)
);

console.log("✅ Rental data generated.");