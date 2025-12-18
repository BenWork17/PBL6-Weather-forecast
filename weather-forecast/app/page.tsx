import { WeatherApp } from "@/components/weather-app"

export default function Home() {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/weather-background_old.jpg')" }}
    >
      <div className="min-h-screen backdrop-blur-sm bg-white/20 dark:bg-slate-900/40">
        <WeatherApp />
      </div>
    </main>
  )
}
