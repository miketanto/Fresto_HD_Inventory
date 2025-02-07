"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../../../components/table/data-table-column-header"
//import { DataTableRowActions } from "../../../components/table/data-table-row-actions"
import { Rental } from "../data/schema"

export const columns: ColumnDef<Rental>[] = [
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rental ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "harddisk_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harddisk" />
    ),
    cell: ({ row }) => {
      const harddisk = row.original.Harddisk;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {harddisk ? `${harddisk.name} (${harddisk.id})` : row.getValue("harddisk_id")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "movie_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Movie ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("movie_id")}</div>,
  },
  {
    accessorKey: "movie_index_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Index ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("movie_index_id")}</div>,
  },
  {
    accessorKey: "rented_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rented At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("rented_at"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "returned_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Returned At" />
    ),
    cell: ({ row }) => {
      const returnedAt = row.getValue("returned_at")
      return (
        <div>
          {returnedAt 
            ? new Date(returnedAt).toLocaleDateString()
            : "Not Returned"}
        </div>
      )
    },
  },
  /*{
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },*/
]