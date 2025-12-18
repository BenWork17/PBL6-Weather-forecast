"use client"

import { useState } from "react"
import { Search, Star, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationSearch } from "@/components/location-search"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Location } from "@/lib/types"
import { vietnamProvinces } from "@/lib/constants"

interface WeatherHeaderProps {
  location: Location
  onLocationChange: (location: Location) => void
  favoriteLocations: Location[]
  onAddFavorite: (location: Location) => void
}

export function WeatherHeader({ location, onLocationChange, favoriteLocations, onAddFavorite }: WeatherHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isFavorite = favoriteLocations.some((loc) => loc.id === location.id)

  return (
    <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-none shadow-lg rounded-none">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">WBC-Weather</h1>
            <div className="hidden md:flex items-center space-x-2">
              <LocationSearch
                onLocationChange={onLocationChange}
                locations={vietnamProvinces}
                currentLocation={location}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddFavorite(location)}
                disabled={isFavorite}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)} className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-4 md:hidden">
            <LocationSearch
              onLocationChange={onLocationChange}
              locations={vietnamProvinces}
              currentLocation={location}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
