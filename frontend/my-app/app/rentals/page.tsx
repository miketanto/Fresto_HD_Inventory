"use client"

import Image from "next/image";
import { DataTable } from "../../components/table/data-table"
import { useState, useEffect } from 'react';
import { columns } from './components/columns'
import { AddRentalDialog } from "./components/add-rental-dialog";
import {Rental} from './data/schema'

interface RentalFormData {
  harddisk_id: number;
  rental_id: number;
}

export default function RentalView() {
  const [rentals, setrentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the rentals from the API when the component mounts
  const fetchrentals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rentals`);
      const rentalsData = await response.json();
      setrentals(rentalsData);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchrentals();
  }, []); // Empty dependency array to run once on mount

  //Callback to add a new harddisk
  const handleLinkHarddisk = async (rentalData:RentalFormData) => {
    setLoading(true);
    const {rental_id, harddisk_id} = rentalData
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rentals/${rental_id}/assign-harddisk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ harddisk_id }),
      });

      if (response.ok) {
        //fetchrentals();
        console.log("ADDED HD")
      } else {
        console.error('Failed to add harddisk');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Harddisk management interface"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Harddisk management interface"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rentals Overview</h2>
            <p className="text-muted-foreground">
              Manage rentals
            </p>
          </div>
        </div>
        <div>
          <AddRentalDialog onSubmit={handleLinkHarddisk} />
        </div>
        <DataTable data={rentals} columns={columns} />
      </div>
    </>
  );
}