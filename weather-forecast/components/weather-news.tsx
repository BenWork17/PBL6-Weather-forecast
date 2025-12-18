import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink, Clock } from "lucide-react"
import type { WeatherNews as WeatherNewsType } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface WeatherNewsProps {
  news: WeatherNewsType[]
  isLoading: boolean
}

export function WeatherNews({ news, isLoading }: WeatherNewsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Tin tức thời tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Newspaper className="h-6 w-6" />
          <span>Tin tức thời tiết</span>
        </h2>
        <Button variant="outline" size="sm">
          Xem tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <Card
            key={index}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gradient-to-br from-sky-400 to-blue-600 relative overflow-hidden">
              <img
                src={article.image || "/placeholder.svg?height=200&width=300"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 left-2" variant="secondary">
                {article.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{article.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(new Date(article.publishedAt))}</span>
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
