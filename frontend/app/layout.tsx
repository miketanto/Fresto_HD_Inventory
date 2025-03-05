import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar"

import { signOut } from './auth';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fresto Harddisk Inventory",
  description: "Fresto Harddisk Inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          
           
          <div className = "fixed top-10 w-screen flex justify-center h-1/10 ">
          <div className="fixed top-10 right-4 flex justify-end h-1/10 ">
            <form
              action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
              }}
              >
              <button className="z-100 flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
              <div className="hidden md:block">Sign Out</div>
              </button>
              </form>
            </div>
          <Menubar>
            <MenubarMenu>
                <a href = "/movies"><MenubarTrigger>Movies</MenubarTrigger></a>
            </MenubarMenu>
            <MenubarMenu>
                <a href = "/harddisk"><MenubarTrigger>Harddisk</MenubarTrigger></a>
            </MenubarMenu>
            <MenubarMenu>
                <a href = "/rentals"><MenubarTrigger>Rentals</MenubarTrigger></a>
            </MenubarMenu>
            <MenubarMenu>
                <a href = "/edit"><MenubarTrigger>Modify Rental</MenubarTrigger></a>
            </MenubarMenu>
            <MenubarMenu>
                <a href = "/dashboard"><MenubarTrigger>Dashboard</MenubarTrigger></a>
            </MenubarMenu>
                
          </Menubar>
          </div>
          {children}
        </body>
      </html>
  );
}
