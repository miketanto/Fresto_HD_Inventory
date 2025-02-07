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

interface RentalFormData {
  harddisk_id: number;
  rental_id: number;
}

export function AddRentalDialog({ 
  onSubmit 
}: { 
  onSubmit: (rentalData: RentalFormData) => void 
}) {
  const [formData, setFormData] = useState<RentalFormData>({
    harddisk_id: 0,
    rental_id: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.rental_id || !formData.harddisk_id) {
      setError("Rental ID and harddisk ID are required");
      return;
    }

    try {
      onSubmit(formData);
      // Reset form
      setFormData({
        harddisk_id: 0,
        rental_id: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Rental</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Rental</DialogTitle>
          <DialogDescription>
            Enter the rental details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="harddisk_id" className="text-right">
                Harddisk ID
              </Label>
              <Input
                id="harddisk_id"
                type="number"
                value={formData.harddisk_id || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rental_id" className="text-right">
                Rental ID
              </Label>
              <Input
                id="rental_id"
                type="number"
                value={formData.rental_id || ''}
                onChange={handleChange}
                className="col-span-3"
                required
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
              <Button type="submit">Save Rental</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}