import { z } from "zod";

// Define Movie schema
export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  rent_total: z.number().min(1),
  created_at: z.date(),
});

export type Movie = z.infer<typeof movieSchema>;

// Define Harddisk schema
export const harddiskSchema = z.object({
  id: z.number(),
  rfid_code: z.string().nullable(),
  ready_for_rental: z.boolean(),
  availability: z.boolean(),
  created_at: z.string().datetime(),
});

export type Harddisk = z.infer<typeof harddiskSchema>;

// Define Rental schema
export const rentalSchema = z.object({
  id: z.number(),
  harddisk_id: z.number().nullable(),
  movie_id: z.number(),
  movie_index_id: z.number(),
  rented_at: z.string().datetime(),
  returned_at: z.string().datetime().nullable(),
  Harddisk: harddiskSchema.optional(),
});

export type Rental = z.infer<typeof rentalSchema>;