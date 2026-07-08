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
import { useDashboardData } from './hooks/useDashboardData'
import { useUserProfile } from './hooks/useUserProfile'
import { user, weather, quickActions, mandi, links, news } from './data/dummy'

export default function App(){
  const { profile, loading: profileLoading, error: profileError, success: profileSuccess } = useUserProfile()
  const { data, loading: dashboardLoading, error: dashboardError } = useDashboardData(profile?.location || 'Madhepura')

  const dashboardWeather = data?.weather || weather
  const dashboardMandi = data?.mandi || mandi
  const dashboardNews = data?.news || news
  const dashboardSchemes = data?.schemes || []
  const userProfile = profile || user

  return (
    <div className="min-h-screen">
      <div className="md:flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-6">
          <Navbar user={userProfile} />

          <ApiStatus loading={profileLoading || dashboardLoading} error={profileError || dashboardError} success={profileSuccess} />

          <div className="mt-4 grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">👋 Namaste, {userProfile.name || 'Ramesh Ji'}</h2>
                      <div className="text-sm text-gray-500">{userProfile.location || 'Madhepura, Bihar'}</div>
                    </div>
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg">Weather Alert</div>
                  </div>

                  <div className="mt-4">
                    <WeatherCard weather={dashboardWeather} />
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-2xl p-4 card-shadow">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
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

          



          <aside className="col-span-4 space-y-4">


             {/* Farmer Image Card */}
            <div className="bg-white rounded-2xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8vxWRzzxmNv-gM3F4Za2EFX5DTDX1_SRcZ0CLxsPN4DcoNbX3hlkvlFAUco0iYbk6AzaLSEqMMzedhaIEPvePBIp41GU5sVcRADnQSgPkxbX52F9XZe-AtoXP6sHAP-F0S9c1s8Aj_3Dj4W0E-Kse66IAXSEDldz4HMDBvNfX_27VV6AG1KFI-ESaB-IP9MsD9M8EOh3Go5Suij5grrQIELk10YgeqmM3Qglwzbe_cSNZ8K-xZGFayh9_BLfB6Qsn5jql_wxrmg"
                alt="Indian Farmer"
                className="w-full h-64 object-cover"
              />
          
              <div className="p-4">
                <h3 className="text-xl font-bold text-green-700">
                  Welcome to Kisaan Saathi 🌾
                </h3>
          
                <p className="mt-2 text-sm text-gray-600">
                  Smart farming starts with the right information. Get weather updates,
                  mandi prices, crop guidance, and government schemes—all in one place.
                </p>
              </div>
          
            </div>





  <HelpfulLinks links={links} />

</aside>
          </div>
        </main>
      </div>

      <div className="md:hidden p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Kisaan Saathi</h2>
            <div className="text-sm text-gray-500">{userProfile.location}</div>
          </div>

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
