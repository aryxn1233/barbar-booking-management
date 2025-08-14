import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Role, BarberProfile } from '../../types';
import { MapPinIcon } from '../../components/Icons';

// A simple scaling factor to make the map viewable
const MAP_SCALE = 20; // km to pixels

const ClientMapView: React.FC = () => {
    const { users, barberProfiles } = useAppContext();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
            (error) => setLocationError("Could not get your location. Please enable location services in your browser.")
        );
    }, []);

    const approvedBarbers = useMemo(() => {
        return users
            .filter(u => u.role === Role.BARBER && u.isApproved && !u.isBanned)
            .map(u => ({
                user: u,
                profile: barberProfiles.find(p => p.userId === u.id)
            }))
            .filter(b => b.profile);
    }, [users, barberProfiles]);
    
    // Calculate barber positions relative to user
    const barberPositions = useMemo(() => {
        if (!userLocation) return [];

        return approvedBarbers.map(b => {
            const profile = b.profile as BarberProfile;
            // A simplified conversion from lat/lng difference to a coordinate system
            // This is not a proper map projection, but serves for visual representation
            const deltaLat = profile.shop.location.lat - userLocation.lat;
            const deltaLng = profile.shop.location.lng - userLocation.lng;
            
            // Approximate pixels from center. Longitude distance changes with latitude.
            const y = -deltaLat * 111 * MAP_SCALE; // ~111km per degree latitude
            const x = deltaLng * 111 * Math.cos(userLocation.lat * Math.PI / 180) * MAP_SCALE;

            return {
                id: b.user.id,
                name: b.user.name,
                x,
                y
            };
        });

    }, [userLocation, approvedBarbers]);


    return (
        <div className="max-w-7xl mx-auto p-4">
             <div>
                <h1 className="text-3xl font-bold text-yellow-500 mb-2">Nearby Barbers</h1>
                <p className="text-gray-500 dark:text-gray-400">Discover barbershops around you on the map.</p>
            </div>
            {locationError && !userLocation && <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-md text-sm">{locationError}</div>}

            <div className="mt-8">
                {userLocation ? (
                    <div className="relative w-full h-[50vh] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                        {/* User's position */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                           <div className="w-5 h-5 bg-yellow-500 rounded-full ring-4 ring-yellow-500/50 animate-pulse" title="Your Location"></div>
                        </div>

                        {/* Barber positions */}
                        {barberPositions.map(b => (
                            <div
                                key={b.id}
                                className="absolute"
                                style={{
                                    top: `calc(50% + ${b.y}px)`,
                                    left: `calc(50% + ${b.x}px)`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <Link to={`/barbers/${b.id}`} onMouseEnter={() => setSelectedBarberId(b.id)} onMouseLeave={() => setSelectedBarberId(null)}>
                                  <MapPinIcon className={`w-8 h-8 transition-all duration-200 ${selectedBarberId === b.id ? 'text-red-500 scale-125' : 'text-blue-600'}`} />
                                </Link>
                                {selectedBarberId === b.id && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                                        {b.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="w-full h-[50vh] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Waiting for your location...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientMapView;
