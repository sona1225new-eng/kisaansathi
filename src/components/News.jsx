import React from 'react'

export default function News({ items }){
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow w-full">
      <h4 className="font-semibold mb-3">Latest Updates & News</h4>
      <div className="space-y-3 text-sm text-gray-600">
        {items.map(n => (
          <div key={n.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-50/40 hover:shadow-sm">
            <div className="w-16 h-12 bg-green-50 rounded-md" />
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="mt-1 text-xs">{n.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
