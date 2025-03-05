"use client"

import { useState, useEffect } from "react"
import { DataTable } from "../../components/table/data-table"
import { DataTableColumnHeader } from "../../components/table/data-table-column-header"
// Import rental page columns
import { columns as rentalColumns } from "../rentals/components/columns"

// Add type definitions for Movie and Rental
interface Movie {
	id: number;
	title: string;
	rented_count: number;
	returned_count: number;
	rent_total: number;
}

interface Rental {
  id: number;
  movie_id: number;
  harddisk_id: number | null;
  movie_index_id: number;
  rented_at: string;
  returned_at: string ;
  movie_name: string;
  // ...additional fields if any...
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DashboardPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Fetch rentals and movies same as in rentals page
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch movies first
      const moviesResponse = await fetch(`${API_URL}/api/movies`)
      const moviesData: Movie[] = await moviesResponse.json()
      setMovies(moviesData)
      // Then fetch rentals
      const rentalsResponse = await fetch(`${API_URL}/api/rentals`)
      let rentalsData: Rental[] = await rentalsResponse.json()
      // Map rentals to include movie name from movies lookup
      rentalsData = rentalsData.map((rental: Rental) => {
        const movie = moviesData.find((m: Movie) => m.id === rental.movie_id)
        return { ...rental, movie_name: movie ? movie.title : "Unknown" }
      })
      setRentals(rentalsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Derive datasets:
  const pendingRentals = rentals.filter(rental => !rental.rented_at)
  const activeRentals = rentals.filter(rental => rental.rented_at && !rental.returned_at)
  const moviesWithIncompleteReturns = movies.filter(movie =>
    movie.rented_count > movie.returned_count && movie.rented_count < movie.rent_total
  )

  if (loading) return <p>Loading Dashboard...</p>

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Pending Rentals</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Rentals not yet started (harddisk linking needed)
        </p>
        <DataTable data={pendingRentals} columns={rentalColumns} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Active Rentals (Not Returned)</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Rentals that have started but not yet returned.
        </p>
        <DataTable data={activeRentals} columns={rentalColumns} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Movies with Incomplete Returns</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Movies where returned count is less than rented count and rented count is less than total rentals.
        </p>
        {/* Movie columns remain unchanged */}
        <DataTable data={moviesWithIncompleteReturns} columns={[
          {
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Title" />,
            accessorKey: "title",
            cell: ({ row }: any) => (
              <a 
                href={`/movies/${row.original.id}`} 
                className="text-blue-500 hover:underline"
              >
                {row.getValue("title")}
              </a>
            )
          },
          {
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Total Rentals" />,
            accessorKey: "rent_total",
          },
          {
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Rented" />,
            accessorKey: "rented_count",
          },
          {
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Returned" />,
            accessorKey: "returned_count",
          }
        ]} />
      </section>
    </div>
  )
}
