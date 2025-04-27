"use client"

import Image from "next/image";
import { DataTable } from "../../../components/table/data-table"
import { useState, useEffect, useCallback } from 'react';
import { columns } from '../../rentals/components/columns'
import { Harddisk, Rental } from "../../harddisk/data/schema";
import { usePathname } from 'next/navigation'
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table"

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
  const [selectedRentals, setSelectedRentals] = useState<number[]>([]);
  const [rentalCount, setRentalCount] = useState(1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRentals = useCallback(async () => {
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
  }, [movieId, API_URL]);

  const handleAddRentals = async () => {
    if (!rentalCount || rentalCount <= 0) {
      alert('Please enter a valid number of rentals.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/movies/${movieId}/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: rentalCount })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add rentals');
      }

      alert('Rentals added successfully');
      fetchRentals(); // Refresh the list
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchStart = async () => {
    if (selectedRentals.length === 0) {
      alert('Please select at least one rental to start.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rentals/batch-start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rentalIds: selectedRentals }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Batch start completed. Failed rentals: ${result.notFoundOrInvalidRentals.join(', ')}`);
        fetchRentals(); // Refresh the list
      } else {
        alert(`Error: ${result.error || 'Failed to batch start rentals.'}`);
      }
    } catch (error) {
      console.error('Error during batch start:', error);
      alert('An error occurred while starting rentals.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedRentals((prev) =>
      prev.includes(id) ? prev.filter((rentalId) => rentalId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (movieId) {
      fetchRentals();
    }
  }, [movieId, status, fetchRentals]);

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
          <input
            type="text"
            value={rentalCount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setRentalCount(value === '' ? 0 : Number(value));
              }
            }}
            onBlur={() => setRentalCount(rentalCount || 1)}
            className="border rounded p-2 w-20"
            placeholder="Count"
          />
          <button
            onClick={handleAddRentals}
            disabled={loading}
            className="bg-green-500 text-white p-2 rounded"
          >
            {loading ? 'Adding Rentals...' : 'Add Rentals'}
          </button>
          <button
            onClick={handleBatchStart}
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {loading ? 'Processing...' : 'Batch Start Selected'}
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable
            data={rentals}
            columns={columns.map((column) =>
              column.id === 'select'
                ? ({
                    ...column,
                    id: 'select', // Explicitly define the id as a string
                    header: () => (
                      <Checkbox
                        checked={
                          selectedRentals.length > 0 && selectedRentals.length === rentals.length
                        }
                        onCheckedChange={(value) => {
                          setSelectedRentals(value ? rentals.map((rental) => rental.id) : []);
                        }}
                        aria-label="Select all rentals"
                        className="translate-y-[2px]"
                      />
                    ),
                    cell: ({ row }: { row: { original: ExtendedRental } }) => (
                      <Checkbox
                        checked={selectedRentals.includes(row.original.id)}
                        onCheckedChange={() => toggleSelection(row.original.id)}
                        aria-label="Select rental"
                        className="translate-y-[2px]"
                      />
                    ),
                  } as ColumnDef<ExtendedRental, unknown>)
                : column
            )}
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