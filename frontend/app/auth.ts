import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '../auth.config';
import { z } from 'zod';
 
async function getUser(credentials: { username: string, password: string }) {
    //console.log(credentials)
    //console.log(`${process.env.NEXT_PUBLIC_AUTH_API_URL}`)
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
        console.log( "Login failed");
        return;
    }
    return data
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [  
    Credentials({
      async authorize(credentials) {
        //console.log(credentials)
        const parsedCredentials = z
          .object({ username: z.string().min(4), password: z.string().min(4) })
          .safeParse(credentials);
        //console.log(parsedCredentials);
        if (parsedCredentials.success) {
          //const { username, password } = parsedCredentials.data;
          const {user} = await getUser(parsedCredentials.data);
          //console.log(token,user)
         // console.log("USER:", user)
          if (!user) return null;
          return user
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});