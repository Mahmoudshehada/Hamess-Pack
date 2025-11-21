
import React, { useEffect, useRef, useState } from 'react';
import { Search, AlertTriangle, Map as MapIcon, X } from 'lucide-react';
import { DeliveryLocation } from '../types';
import { GOOGLE_MAPS_API_KEY, STORE_LOCATION } from '../constants';

interface MapPickerProps {
  onLocationSelect: (location: DeliveryLocation) => void;
  initialLocation?: DeliveryLocation;
}

declare global {
  interface Window {
    google: any;
    initMapCallback: () => void;
    gm_authFailure: () => void;
  }
}

export const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // State to handle map vs manual mode
  const [manualMode, setManualMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressText, setAddressText] = useState(initialLocation?.address || '');
  const [mapReady, setMapReady] = useState(false);

  // Effect to handle Global Auth Failure (Billing/API Activation errors)
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure");
      setManualMode(true);
      setError('Map service unavailable. Please enter address manually.');
      setMapReady(false);
    };
    
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Map configuration missing. Switching to manual entry.');
      setManualMode(true);
    }
  }, []);

  // Effect to load Google Maps Script
  useEffect(() => {
    if (manualMode) return;

    let loadTimeout: ReturnType<typeof setTimeout>;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
         const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
               clearInterval(checkGoogle);
               initMap();
            }
         }, 500);
         return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMapCallback`;
      script.async = true;
      script.defer = true;
      
      window.initMapCallback = () => {
        initMap();
      };
      
      script.onerror = () => {
        console.error("Google Maps script failed to load.");
        setManualMode(true);
        setError('Failed to connect to maps. Please enter address manually.');
      };
      
      document.body.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [manualMode]);

  // Create the "Use My Location" control button to add to the map
  const createLocationControl = (map: any) => {
    const controlDiv = document.createElement('div');
    controlDiv.style.margin = '10px';
    // Fix: Type assertion for index property used by Google Maps controls
    (controlDiv as any).index = 1;

    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.width = '40px';
    controlUI.style.height = '40px';
    controlUI.style.display = 'flex';
    controlUI.style.alignItems = 'center';
    controlUI.style.justifyContent = 'center';
    controlUI.title = 'Your Location';
    controlDiv.appendChild(controlUI);

    // Standard geolocation icon
    controlUI.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#666"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;

    controlUI.addEventListener('click', () => {
       handleCurrentLocation(map);
    });

    return controlDiv;
  };

  const initMap = () => {
    if (manualMode) return;
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
        const defaultPos = initialLocation && initialLocation.lat !== 0
        ? { lat: initialLocation.lat, lng: initialLocation.lng } 
        : { lat: 30.0444, lng: 31.2357 };

        const map = new window.google.maps.Map(mapRef.current, {
            center: defaultPos,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false, // Prevent POI clicks interfering
        });

        googleMapRef.current = map;
        setMapReady(true);

        // Add custom Location Control (replaces FAB)
        const locationControl = createLocationControl(map);
        map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(locationControl);

        const marker = new window.google.maps.Marker({
            position: defaultPos,
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        // Initialize Autocomplete
        if (inputRef.current) {
            try {
                const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                    fields: ['formatted_address', 'geometry', 'place_id'],
                });
                
                autocomplete.bindTo('bounds', map);

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();

                    if (!place.geometry || !place.geometry.location) {
                        // If no geometry (e.g. manual text entered), fallback to text
                        setAddressText(inputRef.current?.value || '');
                        return;
                    }

                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                    }

                    marker.setPosition(place.geometry.location);
                    updateLocation(place.geometry.location, place.formatted_address, place.place_id);
                });
            } catch (e) {
                console.warn("Places API initialization failed:", e);
            }
        }

        // Map Click to Place
        map.addListener('click', (e: any) => {
            const pos = e.latLng;
            marker.setPosition(pos);
            map.panTo(pos); // Center on click
            geocodePosition(pos);
        });

        // Marker Drag End
        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            map.panTo(pos);
            geocodePosition(pos);
        });

    } catch (err) {
        console.error("Error initializing map:", err);
        setManualMode(true);
        setError("Map initialization error. Switched to manual.");
    }
  };

  const geocodePosition = (pos: any) => {
    if (!window.google || !window.google.maps) return;
    try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
            updateLocation(pos, results[0].formatted_address, results[0].place_id);
        } else {
             console.warn("Geocoding failed:", status);
             if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
                 setError("Map services restricted. Address may not update automatically.");
             }
        }
        });
    } catch (e) {
        console.warn("Geocoder error", e);
    }
  };

  const updateLocation = (pos: any, address: string, placeId?: string) => {
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
    
    setAddressText(address);
    if (inputRef.current) {
        inputRef.current.value = address;
    }
    
    calculateDistance(lat, lng, (distanceKm, duration) => {
      onLocationSelect({
        address,
        lat,
        lng,
        placeId,
        distanceKm,
        estimatedDuration: duration
      });
    });
  };

  const calculateDistance = (lat: number, lng: number, callback: (dist: number, dur: string) => void) => {
    if (!window.google || !window.google.maps || !window.google.maps.DistanceMatrixService) {
        callback(0, 'Standard Delivery');
        return;
    }
    
    try {
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
        {
            origins: [STORE_LOCATION],
            destinations: [{ lat, lng }],
            travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
            if (status === 'OK' && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0].status === 'OK') {
                const element = response.rows[0].elements[0];
                const distanceValue = element.distance.value / 1000; // km
                callback(distanceValue, element.duration.text);
            } else {
                callback(0, 'Standard Delivery');
            }
        }
        );
    } catch (e) {
        callback(0, 'Standard Delivery');
    }
  };

  const handleCurrentLocation = (mapInstance?: any) => {
    if (navigator.geolocation) {
      // Show loading cursor
      if (mapRef.current) mapRef.current.style.cursor = 'wait';
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
           if (mapRef.current) mapRef.current.style.cursor = '';
           
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const map = mapInstance || googleMapRef.current;
          if (map && markerRef.current) {
            map.setCenter(pos);
            map.setZoom(17);
            markerRef.current.setPosition(pos);
            geocodePosition(pos);
          }
        },
        (error) => {
          if (mapRef.current) mapRef.current.style.cursor = '';
          console.warn("Geolocation failed", error);
          alert("Could not get current location. Please ensure permissions are allowed.");
        }
      );
    } else {
      alert("Browser does not support geolocation.");
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressText(val);
    onLocationSelect({
        address: val,
        lat: 0,
        lng: 0,
        distanceKm: 0,
        estimatedDuration: 'Standard Delivery'
    });
  };

  if (manualMode) {
      return (
        <div className="space-y-3 animate-fade-in">
            {error && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0" /> 
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto hover:bg-orange-100 rounded-full p-1"><X size={14} /></button>
                </div>
            )}
             <div className="relative">
                <input
                    type="text"
                    placeholder="Enter your full address (City, Street, Building)..."
                    value={addressText}
                    onChange={handleManualChange}
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <MapIcon className="absolute left-3 top-4 text-gray-400" size={20} />
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 px-1">
                    * Providing detailed address helps us deliver faster.
                </p>
                <button 
                    type="button"
                    onClick={() => { setManualMode(false); setError(null); }} 
                    className="text-xs text-brand-600 underline hover:text-brand-800"
                >
                    Try Map Again
                </button>
             </div>
        </div>
      );
  }

  return (
    <div className="space-y-3 relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <AlertTriangle size={16} /> <span className="text-xs">{error}</span>
            </div>
            <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search map..."
          defaultValue={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 group">
        <div ref={mapRef} className="w-full h-full" />
        
        {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                 <div className="flex flex-col items-center p-4 text-center">
                     <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-2"></div>
                     <span className="text-xs text-gray-400">Initializing Map...</span>
                     <div className="mt-4">
                         <button 
                            onClick={() => setManualMode(true)} 
                            className="text-xs text-brand-600 underline hover:text-brand-800"
                         >
                            Problem loading? Enter Address Manually
                         </button>
                     </div>
                 </div>
            </div>
        )}
      </div>
      
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapIcon size={12} />
            <span>Click or drag pin to set location.</span>
         </div>
         <button 
            type="button"
            onClick={() => setManualMode(true)} 
            className="text-xs font-medium text-brand-600 hover:underline px-2 py-1 rounded hover:bg-gray-100"
         >
            Switch to Manual Entry
         </button>
      </div>
    </div>
  );
};
