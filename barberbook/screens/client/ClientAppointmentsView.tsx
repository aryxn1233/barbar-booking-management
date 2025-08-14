import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Appointment } from '../../types';
import { Card, Button, Modal, StarRating } from '../../components/ui';

interface RatingModalState {
    isOpen: boolean;
    appointment: Appointment | null;
    rating: number;
    review: string;
}

const ClientAppointmentsView: React.FC = () => {
    const { currentUser, appointments, getBarberName, getServiceName, updateAppointmentRating } = useAppContext();
    const [ratingModalState, setRatingModalState] = useState<RatingModalState>({ isOpen: false, appointment: null, rating: 0, review: '' });

    const myAppointments = appointments
        .filter(a => a.clientId === currentUser?.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleOpenRatingModal = (appointment: Appointment) => {
        setRatingModalState({ isOpen: true, appointment, rating: appointment.rating || 0, review: appointment.review || '' });
    };

    const handleCloseRatingModal = () => {
        setRatingModalState({ isOpen: false, appointment: null, rating: 0, review: '' });
    };

    const handleConfirmRating = async () => {
        if (ratingModalState.appointment && ratingModalState.rating > 0) {
            await updateAppointmentRating(ratingModalState.appointment.id, ratingModalState.rating, ratingModalState.review);
            handleCloseRatingModal();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-yellow-500 mb-2">My Appointments</h1>
                <p className="text-gray-500 dark:text-gray-400">View your upcoming and past bookings.</p>
            </div>
            <Card>
                <div className="space-y-4">
                  {myAppointments.length > 0 ? myAppointments.map(appt => (
                    <div key={appt.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md sm:flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{getServiceName(appt.barberId, appt.serviceId)}</p>
                            <p className="text-gray-700 dark:text-gray-300">With: {getBarberName(appt.barberId)}</p>
                            <p className="text-gray-600 dark:text-gray-400">Date: {new Date(appt.date).toLocaleString()}</p>
                            <p className="text-gray-600 dark:text-gray-400">Status: <span className="font-semibold text-yellow-600 dark:text-yellow-400">{appt.status}</span></p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex flex-col items-end">
                            {appt.status === 'Completed' && (
                                appt.rating ? (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Your Rating:</p>
                                        <StarRating rating={appt.rating} />
                                    </div>
                                ) : (
                                    <Button onClick={() => handleOpenRatingModal(appt)}>Rate & Review</Button>
                                )
                            )}
                        </div>
                    </div>
                  )) : <p className="text-center text-gray-500 dark:text-gray-400">You have no appointments booked.</p>}
                </div>
            </Card>

            <Modal isOpen={ratingModalState.isOpen} onClose={handleCloseRatingModal} title={`Review your appointment`}>
                <div className="space-y-4">
                    <p>How was your experience with <span className="font-bold text-yellow-500">{getBarberName(ratingModalState.appointment?.barberId || '')}</span>?</p>
                    <div className="flex justify-center">
                       <StarRating rating={ratingModalState.rating} onRate={(r) => setRatingModalState(s => ({...s, rating: r}))} size="h-8 w-8" />
                    </div>
                    <div>
                        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Add a review (optional)</label>
                        <textarea
                            id="reviewText"
                            rows={3}
                            value={ratingModalState.review}
                            onChange={(e) => setRatingModalState(s => ({...s, review: e.target.value}))}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"
                        />
                    </div>
                     <div className="flex justify-end gap-4">
                        <Button variant="secondary" onClick={handleCloseRatingModal}>Cancel</Button>
                        <Button onClick={handleConfirmRating} disabled={ratingModalState.rating === 0}>Submit Review</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClientAppointmentsView;
