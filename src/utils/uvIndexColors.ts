export const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'bg-green-500'
    if (index <= 5) return 'bg-yellow-500'
    if (index <= 7) return 'bg-orange-500'
    if (index <= 10) return 'bg-red-500'
    return 'bg-purple-500'
  }