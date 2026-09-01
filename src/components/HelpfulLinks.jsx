import React from "react";

export default function HelpfulLinks({ links }) {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow w-full">
      <h4 className="font-semibold mb-3">Helpful Links</h4>

      <ul className="space-y-2 text-sm text-gray-600">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition-all duration-300 hover:bg-green-50/60 hover:text-green-700 hover:translate-x-1"
            >
              <span>{link.title}</span>
              <span className="text-green-600">›</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

