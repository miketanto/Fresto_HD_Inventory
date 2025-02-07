"use client"

import Image from "next/image";
import { DataTable } from "../../components/table/data-table"
import { useState, useEffect } from 'react';
import { columns } from './components/columns'
import { AddHarddiskDialog } from "./components/add-harddisk-dialog";
import { MarkReadyDialog } from "./components/mark-ready-dialog";

interface Harddisk {
  id: number;
  rfid_code: string | null;
  ready_for_rental: boolean;
  availability: boolean;
  created_at: string;
}

export default function HarddisksView() {
  const [harddisks, setHarddisks] = useState<Harddisk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the harddisks from the API when the component mounts
  const fetchHarddisks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harddisks`);
      const harddisksData = await response.json();
      setHarddisks(harddisksData);
    } catch (error) {
      console.error('Error fetching harddisks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarddisks();
  }, []); // Empty dependency array to run once on mount

  // Callback to add a new harddisk
  const handleAddHarddisk = async (rfid_code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harddisks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfid_code }),
      });

      if (response.ok) {
        fetchHarddisks();
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


  const handleMarkReady = async (rfid_code:string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harddisks/${rfid_code}/ready`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchHarddisks();
      } else {
        console.error('Failed to mark harddisk as ready');
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
            <h2 className="text-2xl font-bold tracking-tight">Harddisk Overview</h2>
            <p className="text-muted-foreground">
              Manage harddisks and their availability status
            </p>
          </div>
        </div>
        <div>
          <AddHarddiskDialog onSubmit={handleAddHarddisk} />
          <MarkReadyDialog onSubmit={handleMarkReady}/>
        </div>
        <DataTable data={harddisks} columns={columns} />
      </div>
    </>
  );
}