"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Cloud,
  Clock,
  Calendar,
  Map,
  Radar,
  Wind,
  Info,
  History,
  Newspaper,
  MapPin,
  AlertTriangle,
  BarChart3,
  Satellite,
} from "lucide-react"

interface WeatherNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  alertCount: number
}

export function WeatherNavigation({ activeTab, onTabChange, alertCount }: WeatherNavigationProps) {
  const tabs = [
    { id: "current", label: "Hiện tại", icon: Cloud },
    { id: "hourly", label: "Theo giờ", icon: Clock },
    { id: "daily", label: "Theo ngày", icon: Calendar },
    { id: "charts", label: "Biểu đồ", icon: BarChart3 },
    { id: "maps", label: "Bản đồ", icon: Map },
    { id: "radar", label: "Radar", icon: Radar },
    { id: "air-quality", label: "Chất lượng KK", icon: Wind },
    { id: "details", label: "Chi tiết", icon: Info },
    { id: "historical", label: "Lịch sử", icon: History },
    { id: "nasa-power", label: "NASA POWER", icon: Satellite },
    { id: "news", label: "Tin tức", icon: Newspaper },
    { id: "locations", label: "Địa điểm", icon: MapPin },
  ]

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-1 py-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const showBadge = tab.id === "current" && alertCount > 0

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap relative flex-shrink-0 ${
                    isActive ? "bg-sky-500 hover:bg-sky-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {showBadge && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3" />
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </div>
  )
}
