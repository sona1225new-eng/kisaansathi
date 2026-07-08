import React from 'react'
import { FaUsers, FaCloudSun, FaTractor, FaSeedling, FaLeaf, FaUniversity } from 'react-icons/fa'

const iconMap = {
  FaCloudSun: <FaCloudSun className="text-2xl text-green-600"/>,
  FaTractor: <FaTractor className="text-2xl text-green-600"/>,
  FaSeedling: <FaSeedling className="text-2xl text-green-600"/>,
  FaLeaf: <FaLeaf className="text-2xl text-green-600"/>,
  FaUniversity: <FaUniversity className="text-2xl text-green-600"/>,
  FaUsers: <FaUsers className="text-2xl text-green-600"/>
}

export default function QuickActions({ actions }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((a) => (
        <div
          key={a.id}
          onClick={() => {
            if (a.link) {
              window.location.href = a.link;
            }
          }}
          className="cursor-pointer rounded-xl bg-white p-4 flex flex-col items-center text-center text-sm card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-green-50/70"
        >
          <div className="mb-2">
            {iconMap[a.icon] || (
              <FaCloudSun className="text-2xl text-green-600" />
            )}
          </div>

          <div className="text-xs">{a.name}</div>
        </div>
      ))}
    </div>
  );
}