import React, { useState } from 'react';
import ClientHomeView from './client/ClientHomeView';
import ClientAppointmentsView from './client/ClientAppointmentsView';
import ClientMapView from './client/ClientMapView';
import ClientBottomNav from '../components/ClientBottomNav';

export type ClientView = 'home' | 'appointments' | 'map';

const ClientDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<ClientView>('home');

    const renderView = () => {
        switch (activeView) {
            case 'home':
                return <ClientHomeView />;
            case 'appointments':
                return <ClientAppointmentsView />;
            case 'map':
                return <ClientMapView />;
            default:
                return <ClientHomeView />;
        }
    };

    return (
        <div className="pb-20">
            {renderView()}
            <ClientBottomNav activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
};

export default ClientDashboard;