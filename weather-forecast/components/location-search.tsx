"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Location } from "@/lib/types"

interface LocationSearchProps {
  onLocationChange: (location: Location) => void
  locations: Location[]
  currentLocation: Location
}

export function LocationSearch({ onLocationChange, locations, currentLocation }: LocationSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLocations = searchQuery
    ? locations.filter((location) => location.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : locations

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[280px] justify-between bg-white/70 dark:bg-slate-800/70"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-500" />
            <span className="truncate">{currentLocation.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[280px] p-0 max-h-[300px]">
        <Command>
          <CommandInput placeholder="Tìm tỉnh thành..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList className="max-h-[250px] overflow-auto">
            <CommandEmpty>Không tìm thấy địa điểm.</CommandEmpty>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.id}
                  onSelect={() => {
                    onLocationChange(location)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", currentLocation.id === location.id ? "opacity-100" : "opacity-0")}
                  />
                  {location.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
