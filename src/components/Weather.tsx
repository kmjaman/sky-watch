'use client'

import { useState } from 'react'
import axios from 'axios'
import { ForecastData, ForecastResponse, UVIndexData } from '@/types/weather'
import { formatDate, groupForecastByDay } from '@/utils/dateHelper'
import { convertTemperature, getWindDirection, getWindRotation } from '@/utils/weatherUtils'
import { getUVIndexColor } from '@/utils/uvIndexColors'

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
  coord: {
    lat: number
    lon: number
  }
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  dt: number
}

export default function Weather() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [uvIndex, setUvIndex] = useState<number | null>(null)

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        ),
        axios.get<ForecastResponse>(
          `${process.env.NEXT_PUBLIC_OPENWEATHER_FORECAST_URL}?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        )
      ])
      await fetchUVIndex(weatherRes.data.coord.lat, weatherRes.data.coord.lon)
      setWeather(weatherRes.data)
      setForecast(groupForecastByDay(forecastRes.data.list))
    } catch (err) {
      setError('City not found. Please try again.')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUVIndex = async (lat: number, lon: number) => {
    try {
      const response = await axios.get<UVIndexData>(
        `${process.env.NEXT_PUBLIC_OPENWEATHER_ONECALL_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      )
      setUvIndex(response.data.current.uvi)
    } catch (error) {
      console.error('Error fetching UV index:', error)
    }
  }


  const ForecastDisplay = ({ forecast }: { forecast: ForecastData[] }) => (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-2xl font-semibold mb-4">5-Day Forecast</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {forecast.map((day) => (
          <div key={day.dt} className="glass-card p-4 text-center">
            <p className="font-medium mb-2">{formatDate(day.dt_txt)}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
              alt={day.weather[0].main}
              className="w-12 h-12 mx-auto mb-2"
            />
            <div className="flex justify-center gap-2">
              <p className="text-lg font-bold">
                {convertTemperature(day.main.temp_max, unit)}°
              </p>
              <p className="text-lg text-gray-600">
                {convertTemperature(day.main.temp_min, unit)}°
              </p>
            </div>
            <p className="text-sm capitalize text-gray-600">
              {day.weather[0].description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const UnitToggle = () => (
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={() => setUnit('C')}
        className={`px-3 py-1 rounded-full ${unit === 'C' ? 'bg-primary text-white' : 'bg-white/20'}`}
      >
        °C
      </button>
      <button
        onClick={() => setUnit('F')}
        className={`px-3 py-1 rounded-full ${unit === 'F' ? 'bg-primary text-white' : 'bg-white/20'}`}
      >
        °F
      </button>
    </div>
  )

  const WindCompass = ({ degrees }: { degrees: number }) => (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-white/20"></div>
      <div
        className="absolute left-1/2 top-1/2 w-1 h-6 bg-primary transform origin-bottom"
        style={{
          transform: `translate(-50%, -100%) rotate(${getWindRotation(degrees)}deg)`,
        }}
      ></div>
      <span className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs">N</span>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={fetchWeather} className="mb-8 flex gap-2 items-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-1 p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors disabled:opacity-50 rounded-full"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <UnitToggle />
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

          {/* Temperature Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold">
                {convertTemperature(weather.main.temp, unit)}°{unit}
              </p>
              <p className="text-sm text-gray-600">Temperature</p>
              <div className="mt-2 text-sm">
                Feels like {convertTemperature(weather.main.feels_like, unit)}°
              </div>
            </div>
            {/* Wind Card */}
            <div className="glass-card p-4 text-center">
              <div className="flex flex-col items-center">
                <WindCompass degrees={weather.wind.deg} />
                <p className="mt-2 text-3xl font-bold">{weather.wind.speed}m/s</p>
                <p className="text-sm text-gray-600">
                  {getWindDirection(weather.wind.deg)} Wind
                </p>
                {weather.wind.gust && (
                  <p className="text-sm mt-1">Gusts: {weather.wind.gust}m/s</p>
                )}
              </div>
            </div>
            {/* UV Index Card */}
            {uvIndex !== null && (
              <div className="glass-card p-4 text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${getUVIndexColor(
                    uvIndex
                  )} text-white`}
                >
                  <span className="text-xl font-bold">{uvIndex.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">UV Index</p>
                <div className="text-xs mt-1">
                  {uvIndex < 2
                    ? 'Low'
                    : uvIndex < 5
                    ? 'Moderate'
                    : uvIndex < 7
                    ? 'High'
                    : 'Very High'}
                </div>
              </div>
            )}
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

      {forecast.length > 0 && <ForecastDisplay forecast={forecast} />}
      
    </div>
  )
}