export interface ForecastData {
    dt: number
    dt_txt: string
    main: {
      temp: number
      temp_min: number
      temp_max: number
    }
    weather: {
      main: string
      description: string
      icon: string
    }[]
  }
  
  export interface ForecastResponse {
    list: ForecastData[]
    city: {
      name: string
      country: string
    }
  }