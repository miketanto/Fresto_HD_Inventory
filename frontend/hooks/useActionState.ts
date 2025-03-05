"use client";
import { useState } from "react";

type ActionFunction = (prevState: string | undefined, formData: FormData) => Promise<unknown>;

export function useActionState(action: ActionFunction, initialState?: string) : [string, (formData: FormData) => Promise<void>, boolean] {
  const [errorMessage, setErrorMessage] = useState(initialState || '');
  const [isPending, setIsPending] = useState(false);

  const formAction = async (formData: FormData) => {
    setIsPending(true);
    try {
      await action(undefined, formData);
      setErrorMessage('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred.');
      } else {
        setErrorMessage('An error occurred.');
      }
    } finally {
      setIsPending(false);
    }
  };

  return [errorMessage, formAction, isPending];
}