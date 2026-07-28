import React from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import WeatherCard from './components/WeatherCard'
import QuickActions from './components/QuickActions'
import MandiPrices from './components/MandiPrices'
import HelpfulLinks from './components/HelpfulLinks'
import News from './components/News'
import BottomNavigation from './components/BottomNavigation'
import ApiStatus from './components/ApiStatus'
import LocationPermissionBanner from './components/LocationPermissionBanner'
import LocationModal from './components/LocationModal'
import { useLocationContext } from './context/LocationContext'
import { useLocationData } from './hooks/useLocationData'
import { useUserProfile } from './hooks/useUserProfile'
import { user, quickActions, links } from './data/dummy'

export default function App(){
  const { profile, loading: profileLoading, error: profileError, success: profileSuccess } = useUserProfile()
  const { location, openLocationModal } = useLocationContext()

  const {
    weather: locationWeather,
    mandi: locationMandi,
    news: locationNews,
    loading: locationLoading,
    error: locationDataError,
  } = useLocationData()

  // Data with fallbacks — existing component prop shapes are preserved
  const dashboardWeather = locationWeather || { temp: 28, desc: 'Partly Cloudy', feels: 31, humidity: 65, wind: '12 km/h', chance: '20%' }
  const dashboardMandi = locationMandi?.length ? locationMandi : []
  const dashboardNews = locationNews?.length ? locationNews : []
  const userProfile = profile || user

  const isLoading = profileLoading || locationLoading
  const activeError = profileError || locationDataError

  // Determine display location label
  const locationLabel = location?.city
    ? (location.state ? `${location.city}, ${location.state}` : location.city)
    : userProfile.location || 'Madhepura, Bihar'

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Global Location Modal */}
      <LocationModal />

      <div className="md:flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-6 max-w-7xl mx-auto">
          <Navbar user={userProfile} />

          <ApiStatus loading={isLoading} error={activeError} success={profileSuccess} />

          {/* Location Banner */}
          <LocationPermissionBanner />

          <div className="mt-4 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">👋 Namaste, {userProfile.name || 'Ramesh Ji'}</h2>
                      <div
                        onClick={openLocationModal}
                        className="text-xs text-green-700 font-semibold cursor-pointer hover:underline flex items-center gap-1 mt-0.5"
                      >
                        📍 {locationLabel} <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">(Edit ✏️)</span>
                      </div>
                    </div>
                    <div className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-100">
                      Weather Alert
                    </div>
                  </div>

                  <div className="mt-4">
                    <WeatherCard weather={dashboardWeather} />
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-2xl p-4 card-shadow border border-gray-100">
                    <h3 className="font-semibold mb-3 text-gray-800">Quick Actions</h3>
                    <QuickActions actions={quickActions} />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <MandiPrices items={dashboardMandi} />
              </div>

              <div className="mt-6">
                <News items={dashboardNews} />
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 space-y-4">
              {/* Farmer Image Card */}
              <div className="bg-white rounded-2xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8vxWRzzxmNv-gM3F4Za2EFX5DTDX1_SRcZ0CLxsPN4DcoNbX3hlkvlFAUco0iYbk6AzaLSEqMMzedhaIEPvePBIp41GU5sVcRADnQSgPkxbX52F9XZe-AtoXP6sHAP-F0S9c1s8Aj_3Dj4W0E-Kse66IAXSEDldz4HMDBvNfX_27VV6AG1KFI-ESaB-IP9MsD9M8EOh3Go5Suij5grrQIELk10YgeqmM3Qglwzbe_cSNZ8K-xZGFayh9_BLfB6Qsn5jql_wxrmg"
                  alt="Indian Farmer"
                  className="w-full h-64 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-xl font-bold text-green-700">
                    Welcome to Kisaan Saathi 🌾
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Smart farming starts with the right information. Get weather updates,
                    mandi prices, crop guidance, and government schemes—all tailored to <strong>{locationLabel}</strong>.
                  </p>
                </div>
              </div>

              <HelpfulLinks links={links} />
            </aside>
          </div>
        </main>
      </div>

      <div className="md:hidden p-4 pb-20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-green-700">Kisaan Saathi</h2>
            <button
              onClick={openLocationModal}
              className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-lg border border-green-200 font-semibold"
            >
              📍 {locationLabel} (Edit)
            </button>
          </div>

          <LocationPermissionBanner />

          <div className="grid grid-cols-1 gap-4">
            <div>
              <WeatherCard weather={dashboardWeather} />
            </div>
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <QuickActions actions={quickActions} />
            </div>
            <MandiPrices items={dashboardMandi} />
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
