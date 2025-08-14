import React from 'react';
import { HomeIcon, CalendarIcon, MapPinIcon } from './Icons';
import type { ClientView } from '../screens/ClientDashboard';

interface ClientBottomNavProps {
    activeView: ClientView;
    setActiveView: (view: ClientView) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            isActive ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
        }`}
    >
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);


const ClientBottomNav: React.FC<ClientBottomNavProps> = ({ activeView, setActiveView }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-t-lg z-30 flex">
            <NavItem
                icon={<HomeIcon className="w-6 h-6 mb-1" />}
                label="Home"
                isActive={activeView === 'home'}
                onClick={() => setActiveView('home')}
            />
            <NavItem
                icon={<CalendarIcon className="w-6 h-6 mb-1" />}
                label="Bookings"
                isActive={activeView === 'appointments'}
                onClick={() => setActiveView('appointments')}
            />
            <NavItem
                icon={<MapPinIcon className="w-6 h-6 mb-1" />}
                label="Map"
                isActive={activeView === 'map'}
                onClick={() => setActiveView('map')}
            />
        </div>
    );
};

export default ClientBottomNav;
