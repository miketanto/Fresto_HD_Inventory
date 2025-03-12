"use client";
import { useState } from "react";

// Define interface for HarddiskStatus
interface HarddiskStatus {
  ready: boolean;
  availability: boolean;
  rentalAssociated: boolean;
  returned: boolean;
  // ...additional fields if any...
}

export default function EditPage() {
  const [rfid, setRfid] = useState<string>("");
  const [status, setStatus] = useState<HarddiskStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch harddisk status
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/harddisks/${rfid}/status`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Harddisk not found");
      }
      const data: HarddiskStatus = await res.json();
      setStatus(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Call appropriate endpoint based on action
  const handleAction = async (action: "markReady" | "startRental" | "returnRental") => {
    setActionLoading(true);
    setError(null);
    try {
      let endpoint = "";
      if (action === "markReady") {
        endpoint = `${API_URL}/harddisks/${rfid}/ready`;
      } else if (action === "startRental") {
        endpoint = `${API_URL}/rentals/${rfid}/start`;
      } else if (action === "returnRental") {
        endpoint = `${API_URL}/rentals/${rfid}/return`;
      }
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Action failed");
      }
      alert(`${action === "markReady" ? "Marked as ready" : action === "startRental" ? "Rental started" : "Rental returned"} successfully`);
      // Refresh the status
      handleCheckStatus({ preventDefault: () => {} } as React.FormEvent);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
      <form onSubmit={handleCheckStatus} className="mb-4">
        <label htmlFor="rfid" className="block mb-2">Enter Harddisk RFID Code: </label>
        <input
          type="text"
          id="rfid"
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
          className="border p-1 mb-2"
        />
        <button type="submit" disabled={loading || !rfid.trim()} className="bg-blue-500 text-white p-2">
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {status && (
        <div className="mb-4 border p-4 rounded">
          <p><strong>Ready:</strong> {status.ready ? "Yes" : "No"}</p>
          <p><strong>Available:</strong> {status.availability ? "Yes" : "No"}</p>
          <p><strong>Rental Associated:</strong> {status.rentalAssociated ? "Yes" : "No"}</p>
          <p><strong>Returned:</strong> {status.returned ? "Yes" : "No"}</p>
        </div>
      )}

      {status && (
        <div className="flex gap-4">
          {
            !status.rentalAssociated &&(
              <p> Associate Rental First!</p>
            )
          }
          {!status.ready && status.rentalAssociated && (
            <button onClick={() => handleAction("markReady")} disabled={actionLoading} className="bg-purple-500 text-white p-2">
              {actionLoading ? "Processing..." : "Mark Ready"}
            </button>
          )}
          {status.ready && status.rentalAssociated && status.availability &&  !status.returned && (
            <button onClick={() => handleAction("startRental")} disabled={actionLoading} className="bg-green-500 text-white p-2">
              {actionLoading ? "Processing..." : "Start Rental"}
            </button>
          )}
          {status.rentalAssociated && !status.availability && !status.returned && (
            <button onClick={() => handleAction("returnRental")} disabled={actionLoading} className="bg-red-500 text-white p-2">
              {actionLoading ? "Processing..." : "Return Rental"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
