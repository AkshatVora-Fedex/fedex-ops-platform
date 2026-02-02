import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ route = [], center = [20, 0], zoom = 2, showRoutes = true }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [layersVisible, setLayersVisible] = useState({
    routes: true,
    weather: false,
    incidents: false,
  });

  // Default route if none provided
  const defaultRoute = [
    { code: 'MEM', name: 'Memphis', lat: 35.0497, lng: -89.9762, status: 'completed', type: 'origin' },
    { code: 'IND', name: 'Indianapolis', lat: 39.7173, lng: -86.2944, status: 'current', type: 'hub' },
    { code: 'CDG', name: 'Paris CDG', lat: 49.0097, lng: 2.5479, status: 'future', type: 'destination' },
  ];

  const routeData = route.length > 0 ? route : defaultRoute;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstance.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstance.current || routeData.length === 0) return;

    const map = mapInstance.current;

    // Clear existing markers and polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    routeData.forEach((stop) => {
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin ${getMarkerClass(stop.status)}" style="
            border-radius: 50%;
            display: block;
            margin: 0 auto;
            ${getMarkerStyle(stop.status)}
          "></div>
          <div style="
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            margin-top: 4px;
            color: #333;
            text-shadow: 0 0 2px white;
          ">${stop.code}</div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: markerIcon }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 150px;">
          <strong style="font-size: 14px; color: #4D148C;">${stop.name} (${stop.code})</strong><br/>
          <span style="font-size: 11px; color: #666;">Status: <strong>${stop.status}</strong></span><br/>
          <span style="font-size: 11px; color: #666;">Type: ${stop.type || 'hub'}</span>
        </div>
      `);
    });

    // Draw route line if enabled
    if (layersVisible.routes && routeData.length > 1) {
      const latlngs = routeData.map(stop => [stop.lat, stop.lng]);
      
      // Planned route (dashed gray line)
      L.polyline(latlngs, {
        color: '#94A3B8',
        weight: 3,
        opacity: 0.6,
        dashArray: '8, 8',
      }).addTo(map);

      // Actual route (solid orange line for completed segments)
      const completedIndex = routeData.findIndex(stop => stop.status === 'current');
      if (completedIndex > 0) {
        const completedLatlngs = latlngs.slice(0, completedIndex + 1);
        L.polyline(completedLatlngs, {
          color: '#FF6600',
          weight: 4,
          opacity: 0.9,
        }).addTo(map);
      }
    }

    // Fit bounds to show all markers
    if (routeData.length > 0) {
      const bounds = L.latLngBounds(routeData.map(stop => [stop.lat, stop.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData, layersVisible]);

  const getMarkerClass = (status) => {
    switch (status) {
      case 'completed':
        return 'pin-completed';
      case 'current':
        return 'pin-alert';
      case 'future':
        return 'pin-future';
      default:
        return 'pin-future';
    }
  };

  const getMarkerStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'background: #10B981; width: 14px; height: 14px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);';
      case 'current':
        return 'background: #EF4444; width: 22px; height: 22px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulse-red 2s infinite;';
      case 'future':
        return 'background: #9CA3AF; width: 12px; height: 12px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);';
      default:
        return 'background: #9CA3AF; width: 12px; height: 12px; border: 2px solid white;';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded shadow-lg p-3 text-xs">
        <div className="font-bold text-gray-700 mb-2">Layers</div>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={layersVisible.routes}
            onChange={(e) => setLayersVisible({ ...layersVisible, routes: e.target.checked })}
            className="mr-2"
          />
          <span className="text-gray-600">Routes</span>
        </label>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={layersVisible.weather}
            onChange={(e) => setLayersVisible({ ...layersVisible, weather: e.target.checked })}
            className="mr-2"
          />
          <span className="text-gray-600">Weather</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={layersVisible.incidents}
            onChange={(e) => setLayersVisible({ ...layersVisible, incidents: e.target.checked })}
            className="mr-2"
          />
          <span className="text-gray-600">Incidents</span>
        </label>
      </div>

      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;
