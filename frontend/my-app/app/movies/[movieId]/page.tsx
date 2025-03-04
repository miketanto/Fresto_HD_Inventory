"use client"

import Image from "next/image";
import { Separator } from "@/components/ui/separator"
import { DataTable } from "../../../components/table/data-table"
import { useState, useEffect } from 'react';
//import { columns } from '../../harddisk/components/columns'
import { columns } from '../../rentals/components/columns'
import { Harddisk, Rental } from "../../harddisk/data/schema";
import { usePathname } from 'next/navigation'


export default function MovieRentalsView() {
  const pathname = usePathname()
  const movieId = pathname.split('/').pop();
  const [harddisk, setHarddisks] = useState<Harddisk[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'active' | 'returned'>('active');
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch the rentals for the specific movie
  const fetchRentals = async () => {
    setLoading(true);
    try {

      // Fetch movies first
      const moviesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`);
      const moviesData = await moviesResponse.json();
      setMovies(moviesData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movies/${movieId}/rentals`
      );
      const rentalsDataRes: Rental[] = await response.json();
      // Replace movie_id with movie_name using the movies lookup
      const harddisksData = rentalsDataRes
        .map(rental => rental.Harddisk)
        .filter((harddisk): harddisk is Harddisk => harddisk !== null);
      
      const rentalsData = rentalsDataRes.map((rental: any) => {
        const movie = moviesData.find((m: any) => m.id === rental.movie_id);
        return { ...rental, movie_name: movie ? movie.title : 'Unknown' };
      });
      setRentals(rentalsData)
      setHarddisks(harddisksData);
      // Extract just the harddisks from the rentals
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  // New handler: Add Rental
  const handleAddRental = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movies/${movieId}/rentals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // Or add additional fields like comments/harddisk_id if needed
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add rental");
      }
      alert("Rental added successfully");
      fetchRentals(); // refresh list
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchRentals();
    }
  }, [movieId, status]); // Re-fetch when movieId or status changes

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
            {/* New Add Rental button */}
            <button 
              onClick={handleAddRental} 
              disabled={loading} 
              className="bg-blue-500 text-white p-2 rounded"
            >
              {loading ? "Adding Rental..." : "Add Rental"}
            </button>
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable data={rentals} columns={columns} 
          filterable={{
            input: {columnId: "harddisk_id", placeholder: "Filter by movie name..."},
            facets: [{ 
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