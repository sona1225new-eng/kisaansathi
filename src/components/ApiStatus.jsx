import React from 'react';

export default function ApiStatus({ loading, error, success }) {
  if (!loading && !error && !success) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm">
      {loading && <div className="text-blue-600">Loading latest farm insights…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </div>
  );
}
