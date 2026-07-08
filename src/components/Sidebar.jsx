import React from 'react'
import {
  FaHome,
  FaCloudSun,
  FaChartLine,
  FaSeedling,
  FaLeaf,
  FaUniversity,
  FaUsers
} from "react-icons/fa";

const NavItem = ({ icon, children, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
      active
        ? "bg-white shadow-sm"
        : "text-gray-600 hover:bg-white hover:shadow-sm hover:-translate-y-0.5 hover:text-green-700"
    }`}
  >
    <div className="text-green-600">{icon}</div>
    <div className="text-sm font-medium">{children}</div>
  </div>
);

export default function Sidebar(){
  return (
   <aside className="w-72 bg-white border-r border-gray-100 min-h-screen p-6 flex flex-col justify-between shadow-sm">

  <div>

    {/* Logo */}
    <div className="flex items-center gap-3 mb-8">
      <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white text-xl font-bold">
        🌾
      </div>

      <div>
        <h2 className="text-xl font-bold text-green-700">Kisaan Saathi</h2>
        <p className="text-xs text-gray-500">Smart Farming Companion</p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="space-y-2">

      <NavItem icon={<FaHome />} active>
        Home
      </NavItem>

    <NavItem
  icon={<FaCloudSun />}
  onClick={() => (window.location.href = "/weather.html")}
>
  Weather
</NavItem>

<NavItem
  icon={<FaChartLine />}
  onClick={() => (window.location.href = "/mandi.html")}
>
  Mandi Prices
</NavItem>

<NavItem
  icon={<FaSeedling />}
  onClick={() => (window.location.href = "/cropcare.html")}
>
  Crop Care
</NavItem>

<NavItem
  icon={<FaLeaf />}
  onClick={() => (window.location.href = "/organic.html")}
>
  Organic
</NavItem>

<NavItem
  icon={<FaUniversity />}
  onClick={() => (window.location.href = "/schemes.html")}
>
  Govt Schemes
</NavItem>

<NavItem
  icon={<FaUsers />}
  onClick={() => (window.location.href = "/community.html")}
>
  Community
</NavItem>

    </nav>

    {/* Farmer Card */}

    <div className="mt-8 rounded-2xl overflow-hidden bg-green-50 border border-green-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">

      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8vxWRzzxmNv-gM3F4Za2EFX5DTDX1_SRcZ0CLxsPN4DcoNbX3hlkvlFAUco0iYbk6AzaLSEqMMzedhaIEPvePBIp41GU5sVcRADnQSgPkxbX52F9XZe-AtoXP6sHAP-F0S9c1s8Aj_3Dj4W0E-Kse66IAXSEDldz4HMDBvNfX_27VV6AG1KFI-ESaB-IP9MsD9M8EOh3Go5Suij5grrQIELk10YgeqmM3Qglwzbe_cSNZ8K-xZGFayh9_BLfB6Qsn5jql_wxrmg"
        alt="Farmer"
        className="w-full h-44 object-cover"
      />

      <div className="p-4">

        <h3 className="text-lg font-semibold text-green-700">
          Welcome Farmer 🌱
        </h3>

        <p className="text-sm text-gray-600 mt-2 leading-6">
          Get weather forecasts, mandi prices, crop care guidance, organic farming tips and government schemes—all in one place.
        </p>

        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Explore Features
        </button>

      </div>

    </div>

  </div>

  {/* Bottom Links */}

  <div className="border-t pt-5 mt-8">

    <div className="flex items-center gap-3 cursor-pointer py-2 text-gray-600 hover:text-green-700 transition">
      ⚙️
      <span>Settings</span>
    </div>

    <div className="flex items-center gap-3 cursor-pointer py-2 text-gray-600 hover:text-green-700 transition">
      ❓
      <span>Help & Support</span>
    </div>

  </div>

</aside>
  )
}
