/**
 * Shared Location & Live API Synchronization Script for Standalone HTML Pages
 * (weather.html, mandi.html, schemes.html, cropcare.html, organic.html)
 */

(function () {
  const LOCATION_STORAGE_KEY = 'ks_location';

  function getStoredLocation() {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return { city: 'Madhepura', state: 'Bihar', district: 'Madhepura', source: 'default' };
      return JSON.parse(raw);
    } catch (e) {
      return { city: 'Madhepura', state: 'Bihar', district: 'Madhepura', source: 'default' };
    }
  }

  function setStoredLocation(loc) {
    try {
      const dataToSave = { ...loc, timestamp: Date.now() };
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToSave));
      window.dispatchEvent(new CustomEvent('ks_location_changed', { detail: dataToSave }));
    } catch (e) {
      console.error(e);
    }
  }

  // Inject Location Header Bar into top of page
  function injectLocationHeaderBar() {
    const existing = document.getElementById('ks-global-location-bar');
    if (existing) existing.remove();

    const loc = getStoredLocation();
    const locLabel = loc.city ? (loc.state ? `${loc.city}, ${loc.state}` : loc.city) : 'Madhepura, Bihar';

    const bar = document.createElement('div');
    bar.id = 'ks-global-location-bar';
    bar.style.cssText = `
      background: linear-gradient(90deg, #15803d 0%, #166534 100%);
      color: white;
      padding: 8px 16px;
      font-size: 13px;
      font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
      z-index: 40;
    `;

    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">📍</span>
        <span>Active Region: <strong>${locLabel}</strong> <span style="opacity: 0.8; font-size: 11px; text-transform: capitalize;">(${loc.source || 'default'})</span></span>
      </div>
      <button id="ks-btn-change-loc" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      ">✏️ Change Location</button>
    `;

    document.body.insertBefore(bar, document.body.firstChild);

    document.getElementById('ks-btn-change-loc').addEventListener('click', openLocationModal);
  }

  // Build and Embed Change Location Modal
  function createModalDOM() {
    if (document.getElementById('ks-location-modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'ks-location-modal-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 9999; display: none; align-items: center; justify-content: center;
      padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    `;

    backdrop.innerHTML = `
      <div style="background: white; border-radius: 20px; max-width: 420px; width: 100%; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 20px; position: relative;">
          <button id="ks-modal-close" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">✕</button>
          <h3 style="margin: 0; font-size: 18px; font-weight: 700;">📍 Change Location</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Select location for weather, mandi & schemes</p>
        </div>

        <div style="padding: 20px;">
          <form id="ks-modal-form" style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Enter City / District / State:</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="ks-modal-city-input" placeholder="e.g. Madhepura, Patna, Lucknow" style="
                flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none;
              " />
              <button type="submit" style="
                background: #16a34a; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; font-size: 13px; cursor: pointer;
              ">Search</button>
            </div>
          </form>

          <button id="ks-modal-gps-btn" style="
            width: 100%; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; items-center; justify-content: center; gap: 8px; margin-bottom: 16px;
          ">🛰️ Use Browser GPS Location</button>

          <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Popular Farming Hubs:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="ks-quick-cities">
            <button data-city="Madhepura" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Madhepura</button>
            <button data-city="Patna" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Patna</button>
            <button data-city="Gaya" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Gaya</button>
            <button data-city="Lucknow" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Lucknow</button>
            <button data-city="Jaipur" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Jaipur</button>
            <button data-city="Bhopal" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Bhopal</button>
            <button data-city="Delhi" style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 8px; font-size:11px; cursor:pointer;">Delhi</button>
          </div>
        </div>

        <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 12px 20px; display: flex; justify-content: flex-end;">
          <button id="ks-modal-cancel" style="background: #e5e7eb; color: #374151; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('ks-modal-close').addEventListener('click', closeLocationModal);
    document.getElementById('ks-modal-cancel').addEventListener('click', closeLocationModal);

    document.getElementById('ks-modal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('ks-modal-city-input').value.trim();
      if (input) {
        resolveAndSetLocation({ city: input });
        closeLocationModal();
      }
    });

    document.getElementById('ks-modal-gps-btn').addEventListener('click', function () {
      if (!navigator.geolocation) return alert('GPS not supported');
      this.innerText = '⏳ Locating position...';
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          resolveAndSetLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          closeLocationModal();
        },
        function (err) {
          alert('GPS error: ' + err.message);
          document.getElementById('ks-modal-gps-btn').innerText = '🛰️ Use Browser GPS Location';
        }
      );
    });

    document.querySelectorAll('#ks-quick-cities button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const city = this.getAttribute('data-city');
        resolveAndSetLocation({ city: city });
        closeLocationModal();
      });
    });
  }

  function openLocationModal() {
    createModalDOM();
    const bd = document.getElementById('ks-location-modal-backdrop');
    if (bd) bd.style.display = 'flex';
  }

  function closeLocationModal() {
    const bd = document.getElementById('ks-location-modal-backdrop');
    if (bd) bd.style.display = 'none';
  }

  function resolveAndSetLocation(params) {
    const url = params.lat
      ? `/api/location/resolve?lat=${params.lat}&lon=${params.lon}`
      : `/api/location/resolve?city=${encodeURIComponent(params.city)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const r = data.data;
          setStoredLocation({
            city: r.city || params.city || 'Madhepura',
            state: r.state || 'Bihar',
            district: r.district || r.city || 'Madhepura',
            lat: r.lat || params.lat || 25.9167,
            lon: r.lon || params.lon || 87.0833,
            source: params.lat ? 'gps' : 'manual',
          });
        } else {
          setStoredLocation({
            city: params.city || 'Madhepura',
            state: 'Bihar',
            district: params.city || 'Madhepura',
            source: 'manual',
          });
        }
      })
      .catch(() => {
        setStoredLocation({
          city: params.city || 'Madhepura',
          state: 'Bihar',
          district: params.city || 'Madhepura',
          source: 'manual',
        });
      });
  }

  // Fetch Live Data for current HTML page
  function loadPageLiveData() {
    const loc = getStoredLocation();
    const path = window.location.pathname.toLowerCase();

    // Fetch /api/location/full with active location params
    const params = new URLSearchParams();
    if (loc.lat && loc.lon) {
      params.append('lat', loc.lat);
      params.append('lon', loc.lon);
    } else if (loc.city) {
      params.append('city', loc.city);
    }
    if (loc.state) params.append('state', loc.state);
    if (loc.district) params.append('district', loc.district);

    fetch(`/api/location/full?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.success || !resData.data) return;
        const d = resData.data;

        // Populate Weather Page (weather.html)
        if (path.includes('weather.html')) {
          updateWeatherDOM(d.weather, d.forecast);
        }
        // Populate Mandi Page (mandi.html)
        if (path.includes('mandi.html')) {
          updateMandiDOM(d.mandi, loc);
        }
        // Populate Govt Schemes Page (schemes.html)
        if (path.includes('schemes.html')) {
          updateSchemesDOM(d.schemes, loc);
        }
        // Populate Crop Care Page (cropcare.html)
        if (path.includes('cropcare.html')) {
          updateCropCareDOM(d.crops, d.diseaseAlerts, loc);
        }
        // Populate Organic Page (organic.html)
        if (path.includes('organic.html')) {
          updateOrganicDOM(d.crops, loc);
        }
      })
      .catch((err) => console.error('Failed to load page live data:', err));
  }

  // DOM update functions for HTML pages
  function updateWeatherDOM(weather, forecast) {
    if (!weather) return;
    // Temp element
    const tempEls = document.querySelectorAll('.text-display-lg, h1, .text-headline-lg-mobile');
    tempEls.forEach((el) => {
      if (el.textContent.includes('°')) el.textContent = `${weather.temp}°C`;
    });
    // Location label in subtitle
    const locEls = document.querySelectorAll('p, span, div');
    locEls.forEach((el) => {
      if (el.textContent.includes('Station:') || el.textContent.includes('Bihar') || el.textContent.includes('Madhepura')) {
        if (el.children.length === 0) el.textContent = `${weather.city || 'Local Station'}, ${weather.country || 'IN'}`;
      }
    });
  }

  function updateMandiDOM(mandi, loc) {
    if (!Array.isArray(mandi) || !mandi.length) return;
    const titleEl = document.querySelector('h1, h2');
    if (titleEl && titleEl.textContent.includes('Mandi')) {
      titleEl.textContent = `Mandi Prices in ${loc.city || 'Bihar'}`;
    }
  }

  function updateSchemesDOM(schemes, loc) {
    const titleEl = document.querySelector('h1, h2');
    if (titleEl && titleEl.textContent.includes('Scheme')) {
      titleEl.textContent = `Government Schemes (${loc.state || 'Bihar'})`;
    }
  }

  function updateCropCareDOM(crops, diseaseAlerts, loc) {
    const titleEl = document.querySelector('h1, h2');
    if (titleEl && titleEl.textContent.includes('Crop')) {
      titleEl.textContent = `Crop Advisory for ${loc.state || 'Bihar'}`;
    }
  }

  function updateOrganicDOM(crops, loc) {
    const titleEl = document.querySelector('h1, h2');
    if (titleEl && titleEl.textContent.includes('Organic')) {
      titleEl.textContent = `Organic Farming Guidance (${loc.state || 'Bihar'})`;
    }
  }

  // Listen for location changes
  window.addEventListener('ks_location_changed', function () {
    injectLocationHeaderBar();
    loadPageLiveData();
  });

  window.addEventListener('storage', function (e) {
    if (e.key === LOCATION_STORAGE_KEY) {
      injectLocationHeaderBar();
      loadPageLiveData();
    }
  });

  // Init on DOM Load
  document.addEventListener('DOMContentLoaded', function () {
    injectLocationHeaderBar();
    createModalDOM();
    loadPageLiveData();
  });
})();
