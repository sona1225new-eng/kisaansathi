import React from 'react'

export default function MandiPrices({ items }){
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Today's Mandi Prices</h3>
        <a className="cursor-pointer text-sm text-green-600 transition-all duration-300 hover:text-green-700 hover:underline">View All</a>
      </div>

      <div className="space-y-3">
        {items.map(it => (
          <div key={it.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-50/40 hover:shadow-sm">
            <div className="flex items-center gap-3">
                <img
    src={it.image}
    alt={it.name}
    className="w-12 h-12 rounded-md object-cover"
  />
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-500">{it.location}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">{it.price} / quintal</div>
              <div className="text-sm text-green-600">{it.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
