import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Appointment, Role } from '../types';
import { Card, Button } from '../components/ui';
import { UsersIcon, CheckCircleIcon, ClipboardListIcon, XCircleIcon } from '../components/Icons';

type AdminTab = 'users' | 'approvals' | 'appointments';

const AdminDashboard: React.FC = () => {
  const { users, appointments, updateUserStatus, getBarberName, getClientName, getServiceName } = useAppContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const pendingApprovals = users.filter(u => u.role === Role.BARBER && !u.isApproved);

  const handleApprove = (userId: string) => {
    updateUserStatus(userId, { isApproved: true });
  };
  
  const handleToggleBan = (userId: string, isBanned: boolean) => {
    updateUserStatus(userId, { isBanned: !isBanned });
  };

  const renderUsers = () => (
    <div className="space-y-4">
      {users.filter(u => u.role !== Role.ADMIN).map(user => (
        <Card key={user.id} className="flex items-center justify-between">
          <div>
            <p className="font-bold">{user.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({user.role})</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            {user.isBanned && <p className="text-sm text-red-400 font-semibold">BANNED</p>}
          </div>
          <Button
            variant={user.isBanned ? 'primary' : 'danger'}
            onClick={() => handleToggleBan(user.id, user.isBanned)}
          >
            {user.isBanned ? 'Unban' : 'Ban'} User
          </Button>
        </Card>
      ))}
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-4">
      {pendingApprovals.length > 0 ? pendingApprovals.map(user => (
        <Card key={user.id} className="flex items-center justify-between">
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <Button onClick={() => handleApprove(user.id)} className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" /> Approve
          </Button>
        </Card>
      )) : <p className="text-gray-500 dark:text-gray-400 text-center">No pending approvals.</p>}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      {appointments.length > 0 ? appointments.map(appt => (
        <Card key={appt.id}>
          <p className="font-bold">{getServiceName(appt.barberId, appt.serviceId)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Barber: <span className="font-semibold">{getBarberName(appt.barberId)}</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Client: <span className="font-semibold">{getClientName(appt.clientId)}</span></p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date(appt.date).toLocaleString()}</p>
          <p className="text-sm font-semibold text-yellow-500">{appt.status}</p>
        </Card>
      )) : <p className="text-gray-500 dark:text-gray-400 text-center">No appointments found.</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-yellow-500 mb-6">Admin Dashboard</h1>
      <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <TabButton icon={<UsersIcon className="w-5 h-5" />} label="Users" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <TabButton icon={<CheckCircleIcon className="w-5 h-5" />} label="Approvals" count={pendingApprovals.length} isActive={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} />
        <TabButton icon={<ClipboardListIcon className="w-5 h-5" />} label="Appointments" isActive={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
      </div>
      <div>
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'appointments' && renderAppointments()}
      </div>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            isActive
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
        {count && count > 0 && <span className="bg-yellow-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{count}</span>}
    </button>
);


export default AdminDashboard;