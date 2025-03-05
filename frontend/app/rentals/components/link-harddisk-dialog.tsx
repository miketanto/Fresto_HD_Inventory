import { useState } from "react"
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

interface LinkHarddiskDialogProps {
  rentalId: number;
  onSubmit: (rentalId: number, harddiskId: string, comments: string) => Promise<void>;
}

const LinkHarddiskDialog = ({ rentalId, onSubmit }: LinkHarddiskDialogProps) => {
  const [rfidCode, setRfidCode] = useState<string>('');
  const [harddiskId, setHarddiskId] = useState<string>('');
  const [comments, setComments] = useState<string>(''); // NEW state for rental comments
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harddisks/${rfidCode}/rfid`);
      const harddisk = await response.json();

      if (response.ok) {
        if (harddisk.availability) {
          setHarddiskId(harddisk.id)
          setChecked(true);
        } else {
          setError("This harddisk is already assigned to a rental!");
        }
      } else {
        setError("Harddisk not found");
      }
    } catch (error) {
      setError("Error checking harddisk");
      console.error('Error during fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(rentalId, harddiskId, comments); // pass comments
      setRfidCode("");
      setHarddiskId("");
      setComments(""); // reset comments
      setChecked(false);
    } catch (error) {
      setError("Error linking harddisk");
      console.error('Error during submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRfidCode(e.target.value);
    setChecked(false);
    setError(null);
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => { // NEW handler
    setComments(e.target.value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Link Harddisk</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Harddisk to Rental</DialogTitle>
          <DialogDescription>
            Scan or enter the RFID code and add any rental comments.
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
                value={rfidCode}
                onChange={handleChange}
                className="col-span-3"
                disabled={loading}
                autoFocus
              />
            </div>
            {/* NEW: Input for rental comments */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rental_comments" className="text-right">
                Comments
              </Label>
              <Input
                id="rental_comments"
                value={comments}
                onChange={handleCommentsChange}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            {checked ? (
              <DialogClose>
                <Button type="submit" disabled={loading}>
                  Link Harddisk
                </Button>
              </DialogClose>
            ) : (
              <Button 
                type="button" 
                onClick={handleCheck} 
                disabled={loading || !rfidCode.trim()}
              >
                {loading ? "Checking..." : "Check Harddisk"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkHarddiskDialog;