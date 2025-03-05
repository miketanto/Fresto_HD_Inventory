"use client"

import { useState, useEffect } from "react"
import { DataTable } from "../../components/table/data-table"
import { DataTableColumnHeader } from "../../components/table/data-table-column-header"
// Import rental page columns
import { columns as rentalColumns } from "../rentals/components/columns"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DashboardPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Fetch rentals and movies same as in rentals page
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch movies first
      const moviesResponse = await fetch(`${API_URL}/api/movies`)
      const moviesData = await moviesResponse.json()
      setMovies(moviesData)
      // Then fetch rentals
      const rentalsResponse = await fetch(`${API_URL}/api/rentals`)
      let rentalsData = await rentalsResponse.json()
      // Map rentals to include movie name from movies lookup
      rentalsData = rentalsData.map((rental: any) => {
        const movie = moviesData.find((m: any) => m.id === rental.movie_id)
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
