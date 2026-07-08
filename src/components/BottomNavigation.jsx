import React from 'react'
import { FaHome, FaNewspaper, FaStore, FaUsers, FaUser } from 'react-icons/fa'

export default function BottomNavigation(){
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 flex items-center justify-around shadow-lg z-50">
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:text-green-700">
        <FaHome />
      </div>
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:text-green-700">
        <FaNewspaper />
      </div>
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:text-green-700">
        <FaStore />
      </div>
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:text-green-700">
        <FaUsers />
      </div>
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:text-green-700">
        <FaUser />
      </div>
    </nav>
  )
}
