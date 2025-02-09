"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../../../components/table/data-table-column-header"
import { Badge } from "@/components/ui/badge" // You might need to add this component
import {Harddisk} from "../data/schema"

export const columns: ColumnDef<Harddisk>[] = [
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
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "rfid_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RFID Code" />
    ),
    cell: ({ row }) => {
      const rfidCode = row.getValue("rfid_code")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {rfidCode || "Not Set"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "ready_for_rental",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ready for Rental" />
    ),
    cell: ({ row }) => {
      const isReady = row.getValue("ready_for_rental")
      return (
        <Badge variant={isReady ? "success" : "destructive"}>
          {isReady ? "Ready" : "Not Ready"}
        </Badge>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const cellText = row.getValue(columnId) ? "ready" : "not ready"
      return cellText === String(filterValue).toLowerCase()
    },
  },
  {
    accessorKey: "availability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Availability" />
    ),
    cell: ({ row }) => {
      const isAvailable = row.getValue("availability")
      return (
        <Badge variant={isAvailable ? "success" : "destructive"}>
          {isAvailable ? "Available" : "Not Available"}
        </Badge>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const cellText = row.getValue(columnId) ? "available" : "not available"
      return cellText === String(filterValue).toLowerCase()
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      )
    },
  },
]