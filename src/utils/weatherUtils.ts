export const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    return unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)
  }
