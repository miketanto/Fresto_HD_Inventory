"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

// New props type for filterable columns
export interface FilterableColumns {
  input?: {
    columnId: string
    placeholder?: string
  }
  facets?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterable?: FilterableColumns
}

export function DataTableToolbar<TData>({
  table,
  filterable,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filterable?.input && (
          <Input
            placeholder={filterable.input.placeholder || "Filter..."}
            value={
              (table.getColumn(filterable.input.columnId)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              filterable?.input && table.getColumn(filterable.input.columnId)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {filterable?.facets?.map((facet) =>
          table.getColumn(facet.columnId) ? (
            <DataTableFacetedFilter
              key={facet.columnId}
              column={table.getColumn(facet.columnId)}
              title={facet.title}
              options={facet.options}
            />
          ) : null
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}