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
  const [harddisks, setHarddisks] = useState<Harddisk[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'active' | 'returned'>('active');

  // Fetch the rentals for the specific movie
  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movies/${movieId}/rentals`
      );
      const rentalsData: Rental[] = await response.json();
      
      // Extract just the harddisks from the rentals
      const harddisksData = rentalsData
        .map(rental => rental.Harddisk)
        .filter((harddisk): harddisk is Harddisk => harddisk !== null);
      setRentals(rentalsData)
      setHarddisks(harddisksData);
    } catch (error) {
      console.error('Error fetching rentals:', error);
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
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable data={rentals} columns={columns} />
        )}
      </div>
    </>
  );
}