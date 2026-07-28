import React from 'react'
import { FiMapPin, FiEdit3 } from 'react-icons/fi'
import { useLocationContext } from '../context/LocationContext'

export default function WeatherCard({ weather }){
  const { location, openLocationModal } = useLocationContext()

  const locationLabel = location.city
    ? (location.state ? `${location.city}, ${location.state}` : location.city)
    : 'Madhepura, Bihar'

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
      {/* Location Header inside Weather Card */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FiMapPin className="text-green-600" />
          <span className="font-semibold text-gray-700">{locationLabel}</span>
          {location.source && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded capitalize">
              {location.source}
            </span>
          )}
        </div>
        <button
          onClick={openLocationModal}
          className="text-xs text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 transition"
        >
          <FiEdit3 /> Change
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl font-bold text-gray-800">{weather.temp}°C</div>
          <div className="text-sm text-gray-500 font-medium capitalize mt-1">{weather.desc}</div>
        </div>
        <div className="text-yellow-400 text-4xl animate-pulse">☀️</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-500 bg-gray-50/70 p-3 rounded-xl">
        <div>
          <div className="text-xs font-semibold text-gray-700">Feels like</div>
          <div className="mt-1 font-medium">{weather.feels}°C</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-700">Humidity</div>
          <div className="mt-1 font-medium">{weather.humidity}%</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-700">Wind</div>
          <div className="mt-1 font-medium">{weather.wind}</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-medium text-gray-500 flex items-center justify-between">
        <span>Chance of Rain: <strong className="text-green-700">{weather.chance}</strong></span>
        {weather.city && <span className="text-[11px] text-gray-400">Station: {weather.city}</span>}
      </div>
    </div>
  )
}
