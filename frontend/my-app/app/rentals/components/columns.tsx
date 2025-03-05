"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"  // NEW: import Badge for displaying statuses
import { DataTableColumnHeader } from "../../../components/table/data-table-column-header"
import { Rental } from "../data/schema"
import LinkHarddiskDialog from "./link-harddisk-dialog"

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
    accessorKey: "movie_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Movie Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("movie_name")}</div>,
  },
  {
    accessorKey: "harddisk_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harddisk" />
    ),
    cell: ({ row }) => {
      const harddisk = row.original.Harddisk;
      return (
        <div className="flex items-center space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {harddisk ? `${harddisk.rfid_code}` : 'No Harddisk'}
          </span>
          {!harddisk && (
            <LinkHarddiskDialog
              rentalId={row.getValue("id")}
              onSubmit={async (rentalId, harddisk_id, comments) => {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/rentals/${rentalId}/assign-harddisk`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ harddisk_id, comments }),
                  }
                );
                
                if (!response.ok) {
                  throw new Error('Failed to link harddisk');
                }
                
                //await row.table.options.meta?.refreshData();
              }}
            />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "movie_index_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Index ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("movie_index_id")}</div>,
  },
  // Updated: Rental Comments Column with custom filterFn
  {
    accessorKey: "comments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comments" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue("comments") || "No comments"}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const cellText = row.getValue(columnId)
      return cellText === String(filterValue).toLowerCase();
    },
  },
  // Updated: Created At Column remains unchanged
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      );
    },
  },
  // Updated: Rented At Column now displays a badge and uses a custom filterFn
  {
    accessorKey: "rented_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rented At" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("rented_at");
      return value ? (
        <Badge  className = "bg-blue-200 text-black" variant="default">Rented</Badge>
      ) : (
        <Badge variant="destructive">Not Rented</Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const cellText = row.getValue(columnId) ? "rented" : "not rented";
      return cellText === String(filterValue).toLowerCase();
    },
  },
  // Updated: Returned At Column now displays a badge and uses a custom filterFn
  {
    accessorKey: "returned_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Returned At" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("returned_at");
      return value ? (
        <Badge className = "bg-green-200" variant='outline'>Returned</Badge>
      ) : (
        <Badge variant="destructive">Not Returned</Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const cellText = row.getValue(columnId) ? "returned" : "not returned";
      return cellText === String(filterValue).toLowerCase();
    },
  },
]

// --- NEW CODE ---
export const getRowClassName = (row: Rental) => {
  const { rented_at, returned_at } = row;
  return rented_at && returned_at ? "bg-green-200" : "";
}