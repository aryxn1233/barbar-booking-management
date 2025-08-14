import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import NotFoundScreen from './NotFoundScreen';
import { Card, StarRating } from '../components/ui';
import { MapPinIcon } from '../components/Icons';

const BarberProfileScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { users, barberProfiles, appointments } = useAppContext();

    const barber = useMemo(() => users.find(u => u.id === id), [id, users]);
    const profile = useMemo(() => barberProfiles.find(p => p.userId === id), [id, barberProfiles]);

    const { averageRating, ratingCount } = useMemo(() => {
        if (!id) return { averageRating: 0, ratingCount: 0 };
        const myRatedAppointments = appointments.filter(a => a.barberId === id && a.status === 'Completed' && a.rating);
        if (myRatedAppointments.length === 0) return { averageRating: 0, ratingCount: 0 };
        const totalRating = myRatedAppointments.reduce((sum, appt) => sum + (appt.rating || 0), 0);
        return {
            averageRating: totalRating / myRatedAppointments.length,
            ratingCount: myRatedAppointments.length,
        };
    }, [appointments, id]);

    if (!barber || !profile) {
        return <NotFoundScreen />;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Sticky) */}
                <div className="lg:col-span-1 lg:sticky top-24 self-start">
                    <Card className="text-center">
                        <img src={profile.profilePictureUrl} alt={barber.name} className="w-40 h-40 rounded-full mx-auto object-cover mb-4 ring-4 ring-yellow-500" />
                        <h1 className="text-3xl font-bold text-yellow-500">{barber.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{profile.shop.name}</p>
                         <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mt-2">
                            <MapPinIcon className="w-5 h-5" />
                            <span>{profile.shop.address}</span>
                        </div>
                        <div className="flex justify-center mt-3">
                            <StarRating rating={averageRating} />
                            <span className="text-gray-500 dark:text-gray-400 ml-2">({ratingCount} reviews)</span>
                        </div>
                    </Card>
                </div>

                {/* Right Column (Scrollable) */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-2xl font-bold text-yellow-500 mb-3">About Me</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
                    </Card>
                    <Card>
                        <h2 className="text-2xl font-bold text-yellow-500 mb-4">Portfolio</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {profile.portfolio.map(item => (
                                <div key={item.id} className="group relative">
                                    <img src={item.url} alt={item.caption} className="w-full h-40 object-cover rounded-lg shadow-md" />
                                    {item.caption && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white text-sm font-semibold">{item.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                         {profile.portfolio.length === 0 && <p className="text-gray-500 dark:text-gray-400">No portfolio items yet.</p>}
                    </Card>
                    <Card>
                        <h2 className="text-2xl font-bold text-yellow-500 mb-4">Services</h2>
                        <div className="space-y-3">
                           {profile.services.map(service => (
                                <div key={service.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                    <div>
                                        <p className="font-bold text-lg">{service.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{service.duration} mins</p>
                                    </div>
                                    <p className="font-semibold text-lg text-yellow-600">${service.price}</p>
                                </div>
                            ))}
                             {profile.services.length === 0 && <p className="text-gray-500 dark:text-gray-400">No services listed yet.</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BarberProfileScreen;
