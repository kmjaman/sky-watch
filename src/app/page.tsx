import Weather from '../components/Weather'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">
        Weather App
      </h1>
      <Weather />
    </main>
  )
}