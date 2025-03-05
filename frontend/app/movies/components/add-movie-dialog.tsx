"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

// Define MovieData interface
interface Movie {
  id: number
  title: string
  rent_total: number
  created_at: string
  rented_count: number
  returned_count: number
}


export function AddMovieDialog({ onSubmit }: { onSubmit: (movieData: Movie) => Promise<void> }) {
  const [movieData, setMovieData] = useState<Movie>({
    id: 0,
    title: '',
    rent_total: 0,
    created_at: '',
    rented_count: 0,
    returned_count: 0
  })
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    onSubmit(movieData);
    setMovieData({
      id: 0,
      title: '',
      rent_total: 0,
      created_at: '',
      rented_count: 0,
      returned_count: 0
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMovieData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 text-white hover:bg-green-600">Add New Movie</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
          <DialogDescription>
            Enter the details of the new movie. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={movieData.title}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rent_total" className="text-right">
                Rent Total
              </Label>
              <Input
                id="rent_total"
                type="number"
                value={movieData.rent_total}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
            <Button type="submit">Save Movie</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}