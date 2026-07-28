import React, { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { FiMapPin, FiNavigation, FiSearch, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const QUICK_CITIES = [
  { city: 'Madhepura', state: 'Bihar' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Gaya', state: 'Bihar' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Delhi', state: 'Delhi' },
];

export default function LocationModal() {
  const {
    location,
    locationLoading,
    locationError,
    isLocationModalOpen,
    closeLocationModal,
    requestGPS,
    setManualLocation,
    clearLocation,
  } = useLocationContext();

  const [activeTab, setActiveTab] = useState('manual');
  const [cityInput, setCityInput] = useState('');

  if (!isLocationModalOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setManualLocation(cityInput.trim());
      setCityInput('');
    }
  };

  const handleQuickSelect = (city) => {
    setManualLocation(city);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white relative">
          <button
            onClick={closeLocationModal}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Close location modal"
          >
            <FiX className="text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              📍
            </div>
            <div>
              <h3 className="text-xl font-bold">Change Location</h3>
              <p className="text-xs text-green-100 mt-0.5">Select location for weather, mandi & schemes</p>
            </div>
          </div>
        </div>

        {/* Current Active Location Badge */}
        <div className="bg-green-50/70 border-b border-green-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <FiMapPin className="text-green-600 text-lg" />
            <div>
              <span className="font-semibold">Current: </span>
              <span>{location.city}{location.state ? `, ${location.state}` : ''}</span>
              <span className="ml-2 text-xs bg-green-200 text-green-800 font-medium px-2 py-0.5 rounded-full capitalize">
                {location.source || 'default'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiSearch /> Search City / District
            </button>
            <button
              onClick={() => setActiveTab('gps')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'gps'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiNavigation /> Use GPS Geolocation
            </button>
          </div>

          {locationError && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>{locationError}</span>
            </div>
          )}

          {/* TAB 1: Manual Search */}
          {activeTab === 'manual' && (
            <div>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-medium text-gray-700">Enter City, District or State</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g. Madhepura, Patna, Lucknow..."
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                  <button
                    type="submit"
                    disabled={!cityInput.trim() || locationLoading}
                    className="absolute right-2 top-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <FiSearch />
                  </button>
                </div>
              </form>

              {/* Quick Select Cities */}
              <div className="mt-5">
                <div className="text-xs font-semibold text-gray-500 mb-2">Popular Farming Regions</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CITIES.map((c) => {
                    const isSelected = location.city?.toLowerCase() === c.city.toLowerCase();
                    return (
                      <button
                        key={c.city}
                        onClick={() => handleQuickSelect(c.city)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-green-600 text-white border-green-600 font-semibold'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                        }`}
                      >
                        {isSelected && <FiCheckCircle className="text-xs" />}
                        {c.city} ({c.state})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GPS */}
          {activeTab === 'gps' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl">
                🛰️
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Auto-Detect via GPS</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Grant location permission to automatically fetch live weather & mandi prices for your precise coordinates.
                </p>
              </div>

              <button
                onClick={requestGPS}
                disabled={locationLoading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {locationLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" /> Locating position...
                  </>
                ) : (
                  <>
                    <FiNavigation /> Allow GPS Location Access
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={clearLocation}
            className="text-xs text-gray-500 hover:text-gray-800 underline transition"
          >
            Reset to Default
          </button>
          <button
            onClick={closeLocationModal}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
