'use server';
 
import { signIn } from '@/app/auth';
import { AuthError } from 'next-auth';
 
// ...
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      callbackUrl: '/dashboard', // Redirect to /edit after successful login
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type as any) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
}