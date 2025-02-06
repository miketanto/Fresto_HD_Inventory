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



export function AddMovieDialog({ onSubmit }: { onSubmit: (movieData:any) => void }) {
  const [movieData, setMovieData] = useState({
    title: '',
    rent_total: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    onSubmit(movieData);
    setMovieData({ title: '', rent_total: '' });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setMovieData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Movie</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
          <DialogDescription>
            Enter the details of the new movie. Click save when you're done.
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