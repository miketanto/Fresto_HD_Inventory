"use client";
import { useState } from "react";

// ...existing imports if any...

export default function ModifyRentalPage() {
  // --- State for Start Rental Form ---
  const [rfidStart, setRfidStart] = useState("");
  const [harddiskIdStart, setHarddiskIdStart] = useState("");
  const [checkedStart, setCheckedStart] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [errorStart, setErrorStart] = useState<string | null>(null);

  // --- State for Return Rental Form ---
  const [rfidReturn, setRfidReturn] = useState("");
  const [harddiskIdReturn, setHarddiskIdReturn] = useState("");
  const [checkedReturn, setCheckedReturn] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [errorReturn, setErrorReturn] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- Handlers for Start Rental ---
  const handleCheckStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStart(true);
    setErrorStart(null);
    try {
      const res = await fetch(`${API_URL}/api/harddisks/${rfidStart}/rfid`);
      const harddisk = await res.json();
      if (res.ok) {
        if (harddisk.availability) {
          setHarddiskIdStart(harddisk.id);
          setCheckedStart(true);
        } else {
          setErrorStart("This harddisk is not available for starting a rental.");
        }
      } else {
        setErrorStart("Harddisk not found.");
      }
    } catch (error) {
      setErrorStart("Error checking harddisk.");
      console.error(error);
    } finally {
      setLoadingStart(false);
    }
  };

  const handleSubmitStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStart(true);
    setErrorStart(null);
    try {
      const res = await fetch(`${API_URL}/api/rentals/${rfidStart}/start`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // payload if needed
      });
      if (!res.ok) {
        throw new Error("Failed to start rental");
      }
      // Reset states
      setRfidStart("");
      setHarddiskIdStart("");
      setCheckedStart(false);
      alert("Rental started successfully");
    } catch (error) {
      setErrorStart("Error starting rental.");
      console.error(error);
    } finally {
      setLoadingStart(false);
    }
  };

  // --- Handlers for Return Rental ---
  const handleCheckReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReturn(true);
    setErrorReturn(null);
    try {
      const res = await fetch(`${API_URL}/api/harddisks/${rfidReturn}/rfid`);
      const harddisk = await res.json();
      if (res.ok) {
        if (!harddisk.availability) {
          setHarddiskIdReturn(harddisk.id);
          setCheckedReturn(true);
        } else {
          setErrorReturn("This harddisk appears not to be in use.");
        }
      } else {
        setErrorReturn("Harddisk not found.");
      }
    } catch (error) {
      setErrorReturn("Error checking harddisk.");
      console.error(error);
    } finally {
      setLoadingReturn(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReturn(true);
    setErrorReturn(null);
    try {
      const res = await fetch(`${API_URL}/api/rentals/${rfidReturn}/return`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // payload if needed
      });
      if (!res.ok) {
        throw new Error("Failed to return rental");
      }
      // Reset states
      setRfidReturn("");
      setHarddiskIdReturn("");
      setCheckedReturn(false);
      alert("Rental returned successfully");
    } catch (error) {
      setErrorReturn("Error returning rental.");
      console.error(error);
    } finally {
      setLoadingReturn(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 mb-8">
        {/* --- Start Rental Section --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Start Rental</h2>
          <form onSubmit={checkedStart ? handleSubmitStart : handleCheckStart}>
            <div className="mb-4">
              <label htmlFor="rfidStart" className="block">RFID Code</label>
              <input
                type="text"
                id="rfidStart"
                value={rfidStart}
                onChange={(e) => {
                  setRfidStart(e.target.value);
                  setCheckedStart(false);
                  setErrorStart(null);
                }}
                className="border p-1"
              />
            </div>
            {errorStart && <p className="text-red-500 mb-2">{errorStart}</p>}
            <div>
              {checkedStart ? (
                <button type="submit" disabled={loadingStart} className="bg-blue-500 text-white p-2">
                  {loadingStart ? "Submitting..." : "Start Rental"}
                </button>
              ) : (
                <button type="button" onClick={handleCheckStart} disabled={loadingStart || !rfidStart.trim()} className="bg-green-500 text-white p-2">
                  {loadingStart ? "Checking..." : "Check Harddisk"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <div className="rounded-lg border border-green-300 bg-green-50 p-4">
        {/* --- Return Rental Section --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Return Rental</h2>
          <form onSubmit={checkedReturn ? handleSubmitReturn : handleCheckReturn}>
            <div className="mb-4">
              <label htmlFor="rfidReturn" className="block">RFID Code</label>
              <input
                type="text"
                id="rfidReturn"
                value={rfidReturn}
                onChange={(e) => {
                  setRfidReturn(e.target.value);
                  setCheckedReturn(false);
                  setErrorReturn(null);
                }}
                className="border p-1"
              />
            </div>
            {errorReturn && <p className="text-red-500 mb-2">{errorReturn}</p>}
            <div>
              {checkedReturn ? (
                <button type="submit" disabled={loadingReturn} className="bg-green-300 text-white p-2">
                  {loadingReturn ? "Submitting..." : "Return Rental"}
                </button>
              ) : (
                <button type="button" onClick={handleCheckReturn} disabled={loadingReturn || !rfidReturn.trim()} className="bg-green-200 text-white p-2">
                  {loadingReturn ? "Checking..." : "Check Harddisk"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
