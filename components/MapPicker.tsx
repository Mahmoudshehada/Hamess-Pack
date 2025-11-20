import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, AlertTriangle, Map as MapIcon, X } from 'lucide-react';
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
  const autocompleteRef = useRef<any>(null);
  
  // State to handle map vs manual mode
  const [manualMode, setManualMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressText, setAddressText] = useState(initialLocation?.address || '');
  const [mapReady, setMapReady] = useState(false);

  // Effect to handle Global Auth Failure (Billing/API Activation errors)
  useEffect(() => {
    // Define global error handler for Google Maps
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure (Billing or API Key issue)");
      setError('Map service unavailable. Switched to manual entry.');
      setManualMode(true);
      setMapReady(false);
    };
    
    // Check for missing API key immediately
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Configuration missing. Switching to manual entry.');
      setManualMode(true);
    }

    // Cleanup
    return () => {
      window.gm_authFailure = () => {};
    };
  }, []);

  // Effect to load Google Maps Script
  useEffect(() => {
    let loadTimeout: ReturnType<typeof setTimeout>;

    if (manualMode) return;

    const loadGoogleMaps = () => {
      // 1. Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // 2. Check if script is already in DOM (prevent duplicates)
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
         const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
               clearInterval(checkGoogle);
               initMap();
            }
         }, 500);
         
         // Safety timeout for existing script
         loadTimeout = setTimeout(() => {
             clearInterval(checkGoogle);
             if (!mapReady && !manualMode && !window.google) {
                 console.warn("Map loading timed out (existing script).");
                 setError('Map loading timed out. Switched to manual entry.');
                 setManualMode(true);
             }
         }, 8000);
         return;
      }

      // 3. Load the script dynamically
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMapCallback`;
      script.async = true;
      script.defer = true;
      
      window.initMapCallback = () => {
        initMap();
      };
      
      script.onerror = () => {
        setError('Failed to connect to maps. Please enter address manually.');
        setManualMode(true);
      };
      
      document.body.appendChild(script);

      // 4. Safety timeout for script loading
      loadTimeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
             console.warn("Map load timeout");
             if (!manualMode) {
               setError('Map loading timed out. Switching to manual mode.');
               setManualMode(true);
             }
        }
      }, 10000);
    };

    loadGoogleMaps();

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [manualMode]);

  const initMap = () => {
    if (manualMode) return;
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
        const defaultPos = initialLocation && initialLocation.lat !== 0
        ? { lat: initialLocation.lat, lng: initialLocation.lng } 
        : { lat: 30.0444, lng: 31.2357 }; // Default to Cairo

        const map = new window.google.maps.Map(mapRef.current, {
            center: defaultPos,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
        });

        googleMapRef.current = map;
        setMapReady(true); // Assume ready if no crash

        const marker = new window.google.maps.Marker({
            position: defaultPos,
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        // Initialize Autocomplete if input ref exists
        if (inputRef.current) {
            try {
                const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                    fields: ['formatted_address', 'geometry', 'place_id'],
                });
                
                autocomplete.bindTo('bounds', map);
                autocompleteRef.current = autocomplete;

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();

                    if (!place.geometry || !place.geometry.location) {
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
                // We don't fallback to manual here, just autocomplete won't work nicely
            }
        }

        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            map.panTo(pos);
            geocodePosition(pos);
        });

        map.addListener('click', (e: any) => {
            const pos = e.latLng;
            marker.setPosition(pos);
            map.panTo(pos);
            geocodePosition(pos);
        });

    } catch (err) {
        console.error("Error initializing map:", err);
        setError("Map initialization error. Switched to manual.");
        setManualMode(true);
    }
  };

  const geocodePosition = (pos: any) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        updateLocation(pos, results[0].formatted_address, results[0].place_id);
      }
    });
  };

  const updateLocation = (pos: any, address: string, placeId?: string) => {
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
    
    setAddressText(address);
    
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
    // Check if maps API is available, if not (e.g. billing error) return defaults
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
                console.warn("Distance Matrix failed or no route:", status);
                callback(0, 'Standard Delivery');
            }
        }
        );
    } catch (e) {
        console.error("Distance matrix failed", e);
        callback(0, 'Standard Delivery');
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (googleMapRef.current && markerRef.current) {
            googleMapRef.current.setCenter(pos);
            googleMapRef.current.setZoom(17);
            markerRef.current.setPosition(pos);
            geocodePosition(pos);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Geolocation failed", error);
          setError('Geolocation failed. Please pick location manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Browser does not support geolocation.');
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
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                </div>
            )}
             <div className="relative">
                <input
                    type="text"
                    placeholder="Enter your full address details (Street, Building, Floor)..."
                    value={addressText}
                    onChange={handleManualChange}
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <MapIcon className="absolute left-3 top-4 text-gray-400" size={20} />
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 px-1">
                    * Provide detailed address for faster delivery.
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
                <AlertTriangle size={16} /> <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for your address..."
          defaultValue={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
        <div ref={mapRef} className="w-full h-full" />
        
        {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                 <div className="flex flex-col items-center p-4 text-center">
                     <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-2"></div>
                     <span className="text-xs text-gray-400">Loading Map...</span>
                     <button 
                        onClick={() => setManualMode(true)} 
                        className="mt-4 text-xs text-brand-600 underline"
                     >
                        Switch to Manual Entry
                     </button>
                 </div>
            </div>
        )}

        {mapReady && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="bg-white text-brand-600 p-3 rounded-full shadow-lg hover:bg-brand-50 transition flex items-center justify-center group z-20"
                    title="Use current location"
                >
                    <Navigation size={20} className={`group-hover:scale-110 transition ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        )}
      </div>
      
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={12} />
            <span>Drag pin to adjust location.</span>
         </div>
         <button 
            type="button"
            onClick={() => setManualMode(true)} 
            className="text-xs font-medium text-brand-600 hover:underline"
         >
            Enter Address Manually
         </button>
      </div>
    </div>
  );
};
