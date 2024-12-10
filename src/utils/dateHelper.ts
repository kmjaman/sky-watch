import { ForecastData } from "@/types/weather"

export const formatDate = (dt_txt: string): string => {
    const date = new Date(dt_txt)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    })
  }
  
  export const groupForecastByDay = (forecast: ForecastData[]) => {
    const days = new Map<string, ForecastData>()
    forecast.forEach((item) => {
      const dateKey = item.dt_txt.split(' ')[0]
      if (!days.has(dateKey)) {
        days.set(dateKey, item)
      }
    })
    return Array.from(days.values()).slice(0, 5)
  }