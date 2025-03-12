"use client"

import Image from "next/image";
import { DataTable } from "../../../components/table/data-table"
import { useState, useEffect } from 'react';
import { columns } from '../../rentals/components/columns'
import { Harddisk, Rental } from "../../harddisk/data/schema";
import { usePathname } from 'next/navigation'

// Define Movie interface
interface Movie {
  id: number;
  title: string;
  // ...additional fields if any...
}

// Extend Rental to add optional movie_name
interface ExtendedRental extends Rental {
  movie_name?: string;
}

export default function MovieRentalsView() {
  const pathname = usePathname();
  const movieId = pathname ? pathname.split('/').pop() : '';
  const [, setHarddisks] = useState<Harddisk[]>([]);
  const [, setMovies] = useState<Movie[]>([]);
  const [rentals, setRentals] = useState<ExtendedRental[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'active' | 'returned'>('active');
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRentals = async () => {
    setLoading(true);
    try {
      // Fetch movies first
      const moviesResponse = await fetch(`${API_URL}/movies`);
      const moviesData: Movie[] = await moviesResponse.json();
      setMovies(moviesData);

      const response = await fetch(`${API_URL}/movies/${movieId}/rentals`);
      const rentalsDataRes: Rental[] = await response.json();
      
      // Extract harddisks from rentals
      const harddisksData = rentalsDataRes
        .map(rental => rental.Harddisk)
        .filter((harddisk): harddisk is Harddisk => harddisk !== null);
      
      const rentalsData: ExtendedRental[] = rentalsDataRes.map((rental: Rental) => {
        const movie = moviesData.find((m: Movie) => m.id === rental.movie_id);
        return { ...rental, movie_name: movie ? movie.title : 'Unknown' };
      });
      setRentals(rentalsData);
      setHarddisks(harddisksData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching rentals:', error.message);
      } else {
        console.error('Error fetching rentals:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRental = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/movies/${movieId}/rentals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // ...additional fields if needed
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add rental");
      }
      alert("Rental added successfully");
      fetchRentals(); // refresh list
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
        console.error(error.message);
      } else {
        alert("An unknown error occurred");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchRentals();
    }
  }, [movieId, status]);

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Rental management interface"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Rental management interface"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Movie Harddisks</h2>
            <p className="text-muted-foreground">
              View and manage harddisks for this movie
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'active' | 'returned')}
            className="border rounded p-2"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
          </select>
          <button 
            onClick={handleAddRental} 
            disabled={loading} 
            className="bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Adding Rental..." : "Add Rental"}
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable data={rentals} columns={columns} 
            filterable={{
              input: { columnId: "harddisk_id", placeholder: "Filter by movie name..." },
              facets: [
                { 
                  columnId: "comments",
                  title: "Comments",
                  options: [
                    { label: "No Comments", value: "No comments" },
                    { label: "Test", value: "Test" },
                    { label: "Production", value: "Production" },
                  ],
                },
                {
                  columnId: "rented_at",
                  title: "Rented At",
                  options: [
                    { label: "Rented", value: "rented" },
                    { label: "Not Rented", value: "not rented" },
                  ],
                },
                {
                  columnId: "returned_at",
                  title: "Returned At",
                  options: [
                    { label: "Returned", value: "returned" },
                    { label: "Not Returned", value: "not returned" },
                  ],
                }
              ],
            }}
          />
        )}
      </div>
    </>
  );
}