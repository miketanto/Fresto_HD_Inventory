"use client"

import Image from "next/image";
import { DataTable } from "../../components/table/data-table"
import { useState, useEffect } from 'react';
import { columns } from './components/columns'
import { AddRentalDialog } from "./components/add-rental-dialog";
// import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
// import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
//import { useRouter } from "next/navigation"

interface RentalFormData {
  harddisk_id: number;
  rental_id: number;
}

export default function RentalView() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  //const router = useRouter(); // initialize router

  // const isAuthenticated = useIsAuthenticated()
  // const user = useAuthUser()
  // if(!isAuthenticated){
  //   //router.push("/login")
  //   //Redirect using windows location
  //   window.location.href = "/login"
  // }else{
  //   console.log(user)
  // }
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch movies first
      const moviesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`);
      const moviesData = await moviesResponse.json();
      setMovies(moviesData);

      // Then fetch rentals
      const rentalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rentals`);
      let rentalsData = await rentalsResponse.json();
      
      // Replace movie_id with movie_name using the movies lookup
      rentalsData = rentalsData.map((rental: any) => {
        const movie = moviesData.find((m: any) => m.id === rental.movie_id);
        return { ...rental, movie_name: movie ? movie.title : 'Unknown' };
      });
      
      setRentals(rentalsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <DataTable data={rentals} columns={columns} 
          filterable={{
            input: {columnId: "movie_name", placeholder: "Filter by movie name..."},
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
      </div>
    </>
  );
}