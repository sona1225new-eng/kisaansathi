import React from 'react'
import { FiSearch, FiBell } from 'react-icons/fi'

export default function Navbar({ user }){
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-80 relative">
          <input className="w-full rounded-full pl-4 pr-10 py-2 bg-white transition-all duration-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-100" placeholder="Search crops, mandi prices, schemes..." />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <FiBell className="cursor-pointer text-gray-500 transition-all duration-300 hover:scale-110 hover:text-green-600" />
        <div className="cursor-pointer rounded-xl px-2 py-1 transition-all duration-300 hover:bg-green-50 hover:shadow-sm">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.location}</div>
        </div>
      </div>
    </header>
  )
}
