import React from 'react'
import { FiSearch, FiBell, FiMapPin, FiEdit3 } from 'react-icons/fi'
import { useLocationContext } from '../context/LocationContext'
import { useAuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ user }){
  const { location, openLocationModal } = useLocationContext()
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/', { replace: true }); }

  const displayLocation = location.city
    ? (location.state ? `${location.city}, ${location.state}` : location.city)
    : (user.location || 'Madhepura, Bihar')

  return (
    <header className="flex flex-wrap items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-full max-w-xs md:w-80 relative">
          <input className="w-full rounded-full pl-4 pr-10 py-2 bg-white transition-all duration-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-100 border border-gray-100 text-sm" placeholder="Search crops, mandi prices, schemes..." />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Always accessible Change Location Badge */}
        <button
          onClick={openLocationModal}
          id="nav-change-location-btn"
          className="flex items-center gap-2 bg-white hover:bg-green-50 border border-green-200 text-green-800 rounded-xl px-3 py-1.5 transition-all duration-300 shadow-sm hover:shadow group text-xs font-semibold"
          title="Click to change location"
        >
          <FiMapPin className="text-green-600 text-sm group-hover:scale-110 transition-transform" />
          <span className="max-w-[140px] truncate">{displayLocation}</span>
          <span className="bg-green-100 text-green-700 p-1 rounded-md text-[10px] flex items-center gap-1 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <FiEdit3 /> Change
          </span>
        </button>

        <FiBell className="cursor-pointer text-gray-500 transition-all duration-300 hover:scale-110 hover:text-green-600 text-lg ml-1" />

        <div className="cursor-pointer rounded-xl px-2 py-1 transition-all duration-300 hover:bg-green-50 hover:shadow-sm">
          <div className="text-sm font-semibold text-gray-800">{user.name || 'Ramesh Ji'}</div>
          <div className="text-xs text-gray-500 truncate max-w-[120px]">{displayLocation}</div>
        </div>
        <button onClick={handleLogout} className="text-xs font-semibold text-gray-500 hover:text-red-600">Logout</button>
      </div>
    </header>
  )
}
