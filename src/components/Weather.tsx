'use client'

import { useState } from 'react'
import axios from 'axios'

interface WeatherData {
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: {
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
    deg: number
  }
  dt: number
}

export default function Weather() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      )
      setWeather(response.data)
    } catch (err) {
      setError('City not found. Please try again.')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={fetchWeather} className="mb-8 flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-1 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {weather && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="text-gray-600 capitalize">
                {weather.weather[0].description}
              </p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].main}
              className="w-20 h-20"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <p className="text-sm text-gray-600">Temperature</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold">{weather.main.humidity}%</p>
              <p className="text-sm text-gray-600">Humidity</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold">{weather.wind.speed}m/s</p>
              <p className="text-sm text-gray-600">Wind Speed</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold">{weather.main.pressure}hPa</p>
              <p className="text-sm text-gray-600">Pressure</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}