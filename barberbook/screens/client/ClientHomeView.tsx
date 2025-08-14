import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Role, BarberProfile, User, Service, Appointment } from '../../types';
import { Card, Button, Modal, StarRating } from '../../components/ui';
import { MapPinIcon } from '../../components/Icons';

type SortByType = 'rating' | 'distance';

const ClientHomeView: React.FC = () => {
    const { currentUser, users, appointments, barberProfiles, addAppointment } = useAppContext();
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedBarber, setSelectedBarber] = useState<User | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortByType>('rating');

    useEffect(() => {
        if (!navigator.geolocation) {
            const message = "Geolocation is not supported by your browser. You won't be able to sort by distance.";
            setLocationError(message);
            console.error(message);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationError(null);
            },
            (error) => {
                let messageForUser: string;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        messageForUser = `${error.message}. If you want to sort by distance, please check your browser's location settings and permissions for this site.`;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        messageForUser = "Location information is currently unavailable. Check your device's location services.";
                        break;
                    default:
                        messageForUser = `An unknown error occurred while getting location: ${error.message}`;
                        break;
                }
                setLocationError(messageForUser);
            }
        );
    }, []);

    const approvedBarbers = users.filter(u => u.role === Role.BARBER && u.isApproved && !u.isBanned);

    const getBarberProfile = (barberId: string): BarberProfile | undefined => {
        return barberProfiles.find(p => p.userId === barberId);
    };

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        if ((lat1 === lat2) && (lon1 === lon2)) return 0;
        const radlat1 = Math.PI * lat1/180;
        const radlat2 = Math.PI * lat2/180;
        const theta = lon1-lon2;
        const radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) dist = 1;
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344; // miles to km
        return dist;
    };
    
    const getBarberRating = useCallback((barberId: string) => {
        const ratedAppointments = appointments.filter(a => a.barberId === barberId && a.status === 'Completed' && a.rating);
        if (ratedAppointments.length === 0) return { avg: 0, count: 0 };
        const totalRating = ratedAppointments.reduce((sum, appt) => sum + (appt.rating || 0), 0);
        return {
            avg: totalRating / ratedAppointments.length,
            count: ratedAppointments.length
        };
    }, [appointments]);

    const sortedBarbers = useMemo(() => {
        const barbersWithDetails = approvedBarbers.map(barber => {
            const profile = getBarberProfile(barber.id);
            const rating = getBarberRating(barber.id);
            const distance = userLocation && profile ? getDistance(userLocation.lat, userLocation.lng, profile.shop.location.lat, profile.shop.location.lng) : null;
            return { ...barber, profile, rating, distance };
        });

        return barbersWithDetails.sort((a, b) => {
            if (sortBy === 'rating') {
                return b.rating.avg - a.rating.avg || (b.rating.count - a.rating.count);
            }
            if (sortBy === 'distance') {
                if(a.distance === null) return 1;
                if(b.distance === null) return -1;
                return a.distance - b.distance;
            }
            return 0;
        });
    }, [approvedBarbers, getBarberProfile, getBarberRating, userLocation, sortBy]);

    const handleOpenBookingModal = (barber: User, service: Service) => {
        setSelectedBarber(barber);
        setSelectedService(service);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        setBookingDate(tomorrow.toISOString().slice(0, 16));
        setBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        setBookingModalOpen(false);
        setSelectedBarber(null);
        setSelectedService(null);
    };

    const handleConfirmBooking = async () => {
        if (currentUser && selectedBarber && selectedService && bookingDate) {
            await addAppointment({
                clientId: currentUser.id,
                barberId: selectedBarber.id,
                serviceId: selectedService.id,
                date: new Date(bookingDate).toISOString(),
            });
            handleCloseBookingModal();
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto p-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-yellow-500 mb-2">Find a Barber</h1>
                <p className="text-gray-500 dark:text-gray-400">Book your next appointment with our talented professionals.</p>
                {locationError && (
                    <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-md text-sm" role="alert">
                        {locationError}
                    </div>
                )}
                <div className="mt-4 flex items-center gap-4 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Sort by:</span>
                    <Button variant={sortBy === 'rating' ? 'primary' : 'secondary'} onClick={() => setSortBy('rating')}>Top Rated</Button>
                    <Button variant={sortBy === 'distance' ? 'primary' : 'secondary'} onClick={() => setSortBy('distance')} disabled={!userLocation}>
                        Nearest
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBarbers.map(barber => (
                    <Card key={barber.id} className="flex flex-col p-0 overflow-hidden">
                        <Link to={`/barbers/${barber.id}`} className="block hover:opacity-90 transition-opacity">
                           <img src={barber.profile?.profilePictureUrl} alt={barber.name} className="w-full h-48 object-cover" />
                        </Link>
                        <div className="p-6 flex flex-col flex-grow">
                            <Link to={`/barbers/${barber.id}`} className="block">
                                <h3 className="text-xl font-bold text-yellow-500">{barber.name}</h3>
                            </Link>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                                <StarRating rating={barber.rating.avg} />
                                <span>({barber.rating.count})</span>
                            </div>
                            {barber.distance !== null && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPinIcon className="w-4 h-4" />
                                    {barber.distance.toFixed(1)} km away
                                </div>
                            )}
                            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4 h-20 overflow-y-auto flex-grow">{barber.profile?.bio}</p>
                            <div className="space-y-3 mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                                {barber.profile?.services.slice(0, 2).map(service => (
                                    <div key={service.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                        <div>
                                            <p className="font-semibold">{service.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">${service.price} - {service.duration} mins</p>
                                        </div>
                                        <Button onClick={() => handleOpenBookingModal(barber, service)}>Book</Button>
                                    </div>
                                ))}
                                {barber.profile?.services.length === 0 && <p className="text-sm text-center text-gray-500 dark:text-gray-400">No services listed.</p>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={bookingModalOpen} onClose={handleCloseBookingModal} title={`Book with ${selectedBarber?.name}`}>
                {selectedService && (
                    <div className="space-y-4">
                        <p>You are booking: <span className="font-bold text-yellow-500">{selectedService.name}</span></p>
                        <p>Cost: <span className="font-bold">${selectedService.price}</span></p>
                        <p>Duration: <span className="font-bold">{selectedService.duration} minutes</span></p>
                        <div>
                            <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Choose date and time</label>
                            <input
                                type="datetime-local"
                                id="bookingDate"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="mt-1 block w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button variant="secondary" onClick={handleCloseBookingModal}>Cancel</Button>
                            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClientHomeView;
