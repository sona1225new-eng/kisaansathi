import React from 'react'

export default function News({ items }){
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow w-full">
      <h4 className="font-semibold mb-3">Latest Updates & News</h4>
      <div className="space-y-3 text-sm text-gray-600">
        {items.map(n => (
          <div key={n.id} className="bg-white rounded-xl p-4 card-shadow border border-gray-100 mb-3 max-w-full flex cursor-pointer items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
            <div className="w-16 h-12 flex-shrink-0 bg-green-50 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="font-medium line-clamp-2">{n.title}</div>
              <div className="mt-1 text-xs line-clamp-3">{n.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
