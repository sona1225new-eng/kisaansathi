import React from 'react'

export default function WeatherCard({ weather }){
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl font-bold">{weather.temp}°C</div>
          <div className="text-sm text-gray-500">{weather.desc}</div>
        </div>
        <div className="text-yellow-400 text-3xl">☀️</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-500">
        <div>
          <div className="text-sm font-medium">Feels like</div>
          <div className="mt-1">{weather.feels}°C</div>
        </div>
        <div>
          <div className="text-sm font-medium">Humidity</div>
          <div className="mt-1">{weather.humidity}%</div>
        </div>
        <div>
          <div className="text-sm font-medium">Wind</div>
          <div className="mt-1">{weather.wind}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">Chance of Rain: {weather.chance}</div>
    </div>
  )
}
