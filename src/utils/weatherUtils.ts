export const convertTemperature = (temp: number, unit: 'C' | 'F') => {
  return unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)
}

export const getWindDirection = (degrees: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round((degrees % 360) / 45) % 8
  return directions[index]
}

export const getWindRotation = (degrees: number) => {
  return (degrees + 180) % 360
}