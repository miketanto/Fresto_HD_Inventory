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
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface HarddiskData {
  rfid_code: string;
  ready_for_rental?: boolean;
  availability?: boolean;
}

export function MarkReadyDialog({ onSubmit }: { onSubmit: (rfid_code:string) => void }) {
  const [harddiskData, setHarddiskData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harddisks/${harddiskData}/rfid`);
      const harddisk = await response.json();

      if (response.ok) {
        if(harddisk.ready_for_rental == false) setChecked(true)
        else setError("Harddisk is already ready!")
      } else {
        console.error('Failed to check harddisk');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onSubmit(harddiskData);
    setHarddiskData("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setHarddiskData(value);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 text-white hover:bg-green-600">Mark Harddisk Ready</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Harddisk As Ready</DialogTitle>
          <DialogDescription>
            Enter the details of the harddisk ready to be added
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
            {
                checked?
                <DialogClose><Button type = "submit" className="bg-green-500 text-white hover:bg-green-600">Mark Harddisk Ready</Button></DialogClose> : <Button onClick = {handleCheck}>Check Harddisk</Button>
            }
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}