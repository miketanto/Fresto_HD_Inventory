"use client"

import Image from "next/image";
import { Separator } from "@/components/ui/separator"
import { DataTable } from "../../components/table/data-table"
import { useState, useEffect } from 'react';
import {columns} from './components/columns'
import { Button } from "@/components/ui/button";
import { AddMovieDialog } from "./components/add-movie-dialog";

interface Movie {
    id: number
    title: string
    rent_total: number
    created_at: string
  }
  
  export default function MoviesView() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
  
    // Fetch the movies from the API when the component mounts
    const fetchMovies = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`);
          const moviesData = await response.json();
          setMovies(moviesData);
        } catch (error) {
          console.error('Error fetching movies:', error);
        } finally {
          setLoading(false);
        }
      };
    useEffect(() => {
      fetchMovies();
    }, []); // Empty dependency array to run once on mount
  
    // Callback to add a new movie
    const handleAddMovie = async (movieData: Movie) => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(movieData),
        });
  
        if (response.ok) {
          const newMovie = await response.json();
          fetchMovies();
        } else {
          console.error('Failed to add movie');
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
              <h2 className="text-2xl font-bold tracking-tight">Rental Overview</h2>
              <p className="text-muted-foreground">
                Manage current rentals and review rental history
              </p>
            </div>
          </div>
          <div>
            <AddMovieDialog onSubmit={handleAddMovie} />
          </div>
          <DataTable data={movies} columns={columns} />
        </div>
      </>
    );
  }
  