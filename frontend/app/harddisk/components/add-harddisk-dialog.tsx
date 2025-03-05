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

export function AddHarddiskDialog({ onSubmit }: { onSubmit: (rfid_code:string) => void }) {
  const [harddiskData, setHarddiskData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onSubmit(harddiskData);
    setHarddiskData("");
  };

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setHarddiskData(value);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Harddisk</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Harddisk</DialogTitle>
          <DialogDescription>
            Enter the details of the new harddisk. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rfid_code" className="text-right">
                RFID Code
              </Label>
              <Input
                id="rfid_code"
                value={harddiskData}
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
              <Button type="submit">Save Harddisk</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}