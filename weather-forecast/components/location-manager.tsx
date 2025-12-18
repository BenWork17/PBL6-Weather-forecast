"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Trash2, Plus, Search } from "lucide-react"
import type { Location } from "@/lib/types"
import { vietnamProvinces } from "@/lib/constants"

interface LocationManagerProps {
  favoriteLocations: Location[]
  onLocationSelect: (location: Location) => void
  onAddFavorite: (location: Location) => void
  onRemoveFavorite: (locationId: string) => void
}

export function LocationManager({
  favoriteLocations,
  onLocationSelect,
  onAddFavorite,
  onRemoveFavorite,
}: LocationManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLocations = vietnamProvinces.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quản lý địa điểm</h2>

      {/* Favorite Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Địa điểm yêu thích</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteLocations.length === 0 ? (
            <p className="text-muted-foreground">Chưa có địa điểm yêu thích nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteLocations.map((location) => (
                <Card key={location.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1" onClick={() => onLocationSelect(location)}>
                        <MapPin className="h-4 w-4 text-sky-500" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveFavorite(location.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Thêm địa điểm</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tỉnh thành..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredLocations.map((location) => {
              const isFavorite = favoriteLocations.some((fav) => fav.id === location.id)

              return (
                <Card key={location.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1" onClick={() => onLocationSelect(location)}>
                        <MapPin className="h-4 w-4 text-sky-500" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {isFavorite && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 fill-current" />
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAddFavorite(location)}
                          disabled={isFavorite}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
