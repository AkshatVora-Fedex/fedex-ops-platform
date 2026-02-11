import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/GeospatialMap.css';
import { trackingService } from '../services/api';

mapboxgl.accessToken = '***REMOVED***';

// Helper function to safely extract coordinates in [lng, lat] format
const getCoordinates = (locationObj) => {
  if (!locationObj) return null;
  
  // If it's already an array [lng, lat]
  if (Array.isArray(locationObj)) {
    return locationObj.length === 2 ? locationObj : null;
  }
  
  // If it's an object with lng/lat or lon/lat
  if (typeof locationObj === 'object') {
    if ('lng' in locationObj && 'lat' in locationObj) {
      return [locationObj.lng, locationObj.lat];
    }
    if ('lon' in locationObj && 'lat' in locationObj) {
      return [locationObj.lon, locationObj.lat];
    }
    // If it has coordinates property
    if ('coordinates' in locationObj && Array.isArray(locationObj.coordinates)) {
      return locationObj.coordinates.length === 2 ? locationObj.coordinates : null;
    }
  }
  
  return null;
};

function GeospatialMap({ awb, telemetry }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const courierMarker = useRef(null);
  const [lng, setLng] = useState(-90.048981);
  const [lat, setLat] = useState(35.149534);
  const [zoom, setZoom] = useState(9);
  const [routeData, setRouteData] = useState(null);
  const [gpsPosition, setGpsPosition] = useState(null);

  // Use telemetry data for route and GPS position if available
  useEffect(() => {
    if (telemetry?.routeData) {
      setRouteData(telemetry.routeData);
      // Center map on origin
      if (telemetry.routeData.origin) {
        setLat(telemetry.routeData.origin.lat);
        setLng(telemetry.routeData.origin.lng);
      }
    }
    
    // Extract GPS position (latest scan location or current position)
    if (telemetry?.scanTimeline && telemetry.scanTimeline.length > 0) {
      const latestScan = telemetry.scanTimeline[telemetry.scanTimeline.length - 1];
      if (latestScan.location?.coordinates) {
        setGpsPosition({
          coordinates: latestScan.location.coordinates,
          timestamp: latestScan.timestamp,
          driver: latestScan.driver || 'N/A',
          speed: 0
        });
      }
    }
    
    if (awb && !routeData) {
      // Fallback to fetching telemetry if not provided
      const fetchRouteData = async () => {
        try {
          const telemetryRes = await trackingService.getTelemetry(awb);
          if (telemetryRes.data?.data?.routeData) {
            setRouteData(telemetryRes.data.data.routeData);
          }
          if (telemetryRes.data?.data?.scanTimeline) {
            const latestScan = telemetryRes.data.data.scanTimeline[telemetryRes.data.data.scanTimeline.length - 1];
            if (latestScan?.location?.coordinates) {
              setGpsPosition({
                coordinates: latestScan.location.coordinates,
                timestamp: latestScan.timestamp,
                driver: latestScan.driver || 'N/A',
                speed: 0
              });
            }
          }
        } catch (error) {
          console.error('Error fetching route data:', error);
        }
      };
      fetchRouteData();
    }
  }, [telemetry, awb]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add scale
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'imperial'
    }));

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, []);

  // Draw route and markers
  useEffect(() => {
    if (!map.current || !routeData) return;

    map.current.on('load', () => {
      // Add planned route layer
      if (routeData.plannedRoute && !map.current.getSource('planned-route')) {
        map.current.addSource('planned-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeData.plannedRoute
            }
          }
        });

        map.current.addLayer({
          id: 'planned-route-layer',
          type: 'line',
          source: 'planned-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4D148C',
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        });
      }

      // Add actual route (GPS breadcrumb)
      if (routeData.actualRoute && !map.current.getSource('actual-route')) {
        map.current.addSource('actual-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeData.actualRoute
            }
          }
        });

        map.current.addLayer({
          id: 'actual-route-layer',
          type: 'line',
          source: 'actual-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6600',
            'line-width': 3
          }
        });
      }

      // Add scan location markers
      if (routeData.scanLocations) {
        routeData.scanLocations.forEach((location, index) => {
          const coords = getCoordinates(location);
          if (!coords) return; // Skip if coordinates invalid
          
          const el = document.createElement('div');
          el.className = 'scan-marker';
          el.style.backgroundColor = getScanColor(location.type);
          el.innerHTML = `<span class="material-icons">${getScanIcon(location.type)}</span>`;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="scan-popup">
              <strong>${location.code}</strong>
              <p>${location.facility || 'Unknown Facility'}</p>
              <p class="scan-time">${location.timestamp}</p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(map.current);
        });
      }

      // Add origin marker
      if (routeData.origin) {
        const originCoords = getCoordinates(routeData.origin);
        if (originCoords) {
          const originEl = document.createElement('div');
          originEl.className = 'origin-marker';
          originEl.innerHTML = '<span class="material-icons">flight_takeoff</span>';

          new mapboxgl.Marker(originEl)
            .setLngLat(originCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="location-popup">
                <strong>Origin</strong>
                <p>${routeData.origin.city || 'Origin'}, ${routeData.origin.country || ''}</p>
              </div>
            `))
            .addTo(map.current);
        }
      }

      // Add destination marker
      if (routeData.destination) {
        const destCoords = getCoordinates(routeData.destination);
        if (destCoords) {
          const destEl = document.createElement('div');
          destEl.className = 'destination-marker';
          destEl.innerHTML = '<span class="material-icons">flag</span>';

          new mapboxgl.Marker(destEl)
            .setLngLat(destCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="location-popup">
                <strong>Destination</strong>
                <p>${routeData.destination.city || 'Destination'}, ${routeData.destination.country || ''}</p>
              </div>
            `))
            .addTo(map.current);
        }
      }

      // Fit bounds to show all markers
      if (routeData.plannedRoute && routeData.plannedRoute.length > 0) {
        const bounds = routeData.plannedRoute.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(routeData.plannedRoute[0], routeData.plannedRoute[0]));

        map.current.fitBounds(bounds, {
          padding: 50
        });
      }
    });
  }, [routeData]);

  // Update courier position
  useEffect(() => {
    if (!map.current || !gpsPosition) return;

    const courierCoords = getCoordinates(gpsPosition);
    if (!courierCoords) return;

    if (courierMarker.current) {
      courierMarker.current.setLngLat(courierCoords);
    } else {
      const courierEl = document.createElement('div');
      courierEl.className = 'courier-marker';
      courierEl.innerHTML = '<span class="material-icons">local_shipping</span>';

      courierMarker.current = new mapboxgl.Marker(courierEl)
        .setLngLat(courierCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="courier-popup">
            <strong>Courier Position</strong>
            <p>Speed: ${gpsPosition.speed || 0} mph</p>
            <p>Updated: ${gpsPosition.timestamp}</p>
            <p>Driver: ${gpsPosition.driver || 'N/A'}</p>
          </div>
        `))
        .addTo(map.current);
    }
  }, [gpsPosition]);

  const getScanColor = (type) => {
    const colors = {
      'PUX': '#10B981', // Green - Pickup
      'DEX': '#3B82F6', // Blue - Delivery
      'STAT': '#8B5CF6', // Purple - Status
      'HEX': '#F59E0B', // Amber - Hub Exception
      'REX': '#EF4444', // Red - Return Exception
      'SEP': '#6366F1', // Indigo - Security Exception
      'CONS': '#EC4899', // Pink - Consignee
      'DDEX': '#14B8A6'  // Teal - Delivery Exception
    };
    return colors[type] || '#9CA3AF';
  };

  const getScanIcon = (type) => {
    const icons = {
      'PUX': 'upload',
      'DEX': 'done',
      'STAT': 'info',
      'HEX': 'warning',
      'REX': 'keyboard_return',
      'SEP': 'shield',
      'CONS': 'person',
      'DDEX': 'error'
    };
    return icons[type] || 'location_on';
  };

  return (
    <div className="geospatial-map-container">
      <div className="map-header">
        <h3>
          <span className="material-icons">map</span>
          Live Route Tracking
        </h3>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-line planned"></div>
            <span>Planned Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-line actual"></div>
            <span>Actual Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker courier"></div>
            <span>Courier Position</span>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="map-canvas" />
      <div className="map-info">
        <span>Longitude: {lng}</span>
        <span>Latitude: {lat}</span>
        <span>Zoom: {zoom}</span>
        {gpsPosition && (
          <span className="live-indicator">
            <span className="pulse-dot"></span>
            Live Tracking
          </span>
        )}
      </div>
    </div>
  );
}

export default GeospatialMap;
