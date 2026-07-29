'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title: string;
    price: number;
    type: string;
    onClick?: () => void;
  }>;
  className?: string;
  single?: boolean;
}

const TOGO_CENTER: [number, number] = [8.6195, 1.0];

const MARKER_COLORS: Record<string, string> = {
  chambre: '#047857',
  studio: '#d97706',
  appartement: '#2563eb',
};

export default function MapView({ latitude, longitude, title, markers, className = '', single = false }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: !single,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    if (markers && markers.length > 0) {
      // Multiple markers mode (search page)
      const bounds: L.LatLngBounds = L.latLngBounds([]);

      markers.forEach((marker) => {
        const color = MARKER_COLORS[marker.type] || '#047857';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${color};
            width: 32px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${(marker.price / 1000).toFixed(0)}k</div>`,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -42],
        });

        const m = L.marker([marker.latitude, marker.longitude], { icon }).addTo(map);
        m.bindPopup(`
          <div style="font-family: system-ui; min-width: 140px;">
            <strong style="font-size: 13px;">${marker.title}</strong>
            <div style="color: ${color}; font-weight: 600; font-size: 14px; margin-top: 4px;">
              ${marker.price.toLocaleString()} FCFA
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 2px; text-transform: capitalize;">
              ${marker.type}
            </div>
          </div>
        `);
        if (marker.onClick) {
          m.on('click', marker.onClick);
        }
        bounds.extend([marker.latitude, marker.longitude]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
      }
    } else if (latitude && longitude) {
      // Single marker mode (listing detail)
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: #047857;
          width: 36px;
          height: 46px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          border: 3px solid white;
        "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 46],
      });

      const m = L.marker([latitude, longitude], { icon }).addTo(map);
      if (title) {
        m.bindPopup(`<div style="font-family: system-ui;"><strong>${title}</strong></div>`);
      }
      map.setView([latitude, longitude], 15);
    } else {
      // Default: show all of Togo
      map.setView(TOGO_CENTER, 7);
    }

    // Fix map rendering on dynamic container
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, title, markers, single]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
      {/* Map overlay for styling consistency */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border-radius: 8px !important;
          overflow: hidden !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          color: #374151 !important;
          background: white !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 10px 14px !important;
          line-height: 1.4 !important;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255,255,255,0.8) !important;
          border-radius: 4px 0 0 0 !important;
          padding: 2px 6px !important;
        }
        .leaflet-control-attribution a {
          color: #047857 !important;
        }
      `}</style>
    </div>
  );
}
