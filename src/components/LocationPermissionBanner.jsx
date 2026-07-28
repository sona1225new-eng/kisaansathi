import React, { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { FiMapPin, FiNavigation, FiEdit, FiX } from 'react-icons/fi';

export default function LocationPermissionBanner() {
  const {
    location,
    locationLoading,
    locationError,
    requestGPS,
    setManualLocation,
    openLocationModal,
  } = useLocationContext();

  const [showManual, setShowManual] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // If user has already selected location or dismissed, show a compact location chip or hide
  if (dismissed) return null;

  if (location.source !== 'default') {
    return (
      <div className="bg-green-50/80 border border-green-200 rounded-xl px-4 py-2 mb-4 flex items-center justify-between text-xs text-green-800">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-green-600 text-sm" />
          <span>
            Active Location: <strong>{location.city}{location.state ? `, ${location.state}` : ''}</strong> ({location.source})
          </span>
        </div>
        <button
          onClick={openLocationModal}
          className="text-green-700 hover:text-green-900 font-semibold underline flex items-center gap-1"
        >
          <FiEdit /> Change Location
        </button>
      </div>
    );
  }

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setManualLocation(cityInput.trim());
      setDismissed(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 relative shadow-sm">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="Dismiss banner"
      >
        <FiX />
      </button>

      {!showManual ? (
        <>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <div className="font-semibold text-sm text-green-900">
                अपनी लोकेशन दें — Get Personalized Farming Data
              </div>
              <div className="text-xs text-green-700">
                Live weather, mandi prices & Govt schemes for your region
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestGPS}
              disabled={locationLoading}
              id="btn-allow-gps"
              className="bg-green-600 text-white border-none rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-70 transition flex items-center gap-1.5"
            >
              <FiNavigation /> {locationLoading ? 'Locating...' : 'Allow GPS'}
            </button>
            <button
              onClick={() => setShowManual(true)}
              id="btn-manual-location"
              className="bg-white text-green-700 border border-green-600 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-green-50 transition flex items-center gap-1"
            >
              <FiEdit /> Enter Manually
            </button>
          </div>

          {locationError && (
            <div className="w-full text-xs text-red-600 mt-1">
              ⚠️ {locationError} — Try manual entry instead.
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 flex-wrap w-full">
          <span className="text-xs font-semibold text-green-900">
            📌 Enter District / City:
          </span>
          <input
            id="input-manual-city"
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="e.g. Madhepura, Patna, Lucknow"
            autoFocus
            className="border border-green-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[180px]"
          />
          <button
            type="submit"
            disabled={!cityInput.trim() || locationLoading}
            id="btn-submit-manual-city"
            className="bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            Set Location
          </button>
          <button
            type="button"
            onClick={() => setShowManual(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
