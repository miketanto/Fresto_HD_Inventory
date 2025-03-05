"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../../../components/table/data-table-column-header"
//import { DataTableRowActions } from "../../../components/table/data-table-row-actions"

// Define the Movie type including computed fields.
interface Movie {
  id: number
  title: string
  rent_total: number
  rented_count: number
  returned_count: number
  created_at: string
}

export const columns: ColumnDef<Movie>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <a 
        href={`/movies/${row.original.id}`} // Adjust link as needed
        className="max-w-[500px] truncate font-medium text-blue-500 hover:underline"
      >
        {row.getValue("title")}
      </a>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "rent_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Rentals" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("rent_total")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "rented_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rented" />
    ),
    cell: ({ row }) => <div>{row.getValue("rented_count")}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "returned_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Returned" />
    ),
    cell: ({ row }) => <div>{row.getValue("returned_count")}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <div>{date.toLocaleDateString()}</div>
    },
    enableSorting: true,
  },
  /*{
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },*/
]