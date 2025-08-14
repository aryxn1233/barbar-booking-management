import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { BarberProfile, Service, PortfolioItem } from '../types';
import { Card, Button, Input, StarRating } from '../components/ui';
import { XCircleIcon, CameraIcon, PlusIcon } from '../components/Icons';

const BarberDashboard: React.FC = () => {
  const { currentUser, appointments, barberProfiles, updateBarberProfile, getClientName, getServiceName } = useAppContext();
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const currentProfile = barberProfiles.find(p => p.userId === currentUser.id);
      if(currentProfile) {
        // Deep copy to prevent direct mutation of context state
        setProfile(JSON.parse(JSON.stringify(currentProfile)));
      }
    }
  }, [currentUser, barberProfiles]);

  const { averageRating, ratingCount } = useMemo(() => {
    if (!currentUser) return { averageRating: 0, ratingCount: 0 };
    const myRatedAppointments = appointments.filter(a => a.barberId === currentUser.id && a.status === 'Completed' && a.rating);
    if (myRatedAppointments.length === 0) return { averageRating: 0, ratingCount: 0 };
    const totalRating = myRatedAppointments.reduce((sum, appt) => sum + (appt.rating || 0), 0);
    return {
      averageRating: totalRating / myRatedAppointments.length,
      ratingCount: myRatedAppointments.length,
    };
  }, [appointments, currentUser]);

  const myAppointments = appointments.filter(a => a.barberId === currentUser?.id);

  const handleProfileUpdate = () => {
    if (profile) {
      updateBarberProfile(profile).then(() => {
        setIsEditing(false);
      });
    }
  };
  
  const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
    if(profile){
        const newServices = [...profile.services];
        const serviceToUpdate = { ...newServices[index] };
        (serviceToUpdate[field] as any) = value;
        newServices[index] = serviceToUpdate;
        setProfile({...profile, services: newServices});
    }
  };
  
  const addService = () => {
    if(profile){
        const newService: Service = { id: `s-${Date.now()}`, name: 'New Service', price: 0, duration: 30 };
        setProfile({...profile, services: [...profile.services, newService]});
    }
  };

  const removeService = (serviceId: string) => {
    if(profile){
        setProfile({...profile, services: profile.services.filter(s => s.id !== serviceId)});
    }
  };

  const addPortfolioItem = () => {
    if (profile) {
        const newItem: PortfolioItem = {
            id: `p-${Date.now()}`,
            type: 'image',
            url: `https://picsum.photos/seed/${Date.now()}/400`,
            caption: 'New Work',
        };
        setProfile({...profile, portfolio: [...profile.portfolio, newItem]});
    }
  };

  const removePortfolioItem = (itemId: string) => {
    if(profile){
        setProfile({...profile, portfolio: profile.portfolio.filter(p => p.id !== itemId)});
    }
  }

  if (!currentUser || !profile) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser.isApproved) {
    return (
        <div className="text-center p-10">
            <h1 className="text-3xl font-bold text-yellow-500">Pending Approval</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-4">Your account is currently under review by an administrator. You will be able to access your dashboard once approved.</p>
        </div>
    );
  }

  const renderViewMode = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <img src={profile.profilePictureUrl} alt={currentUser.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4 ring-4 ring-yellow-500" />
                <h2 className="text-2xl font-bold text-center text-yellow-500">{profile.shop.name}</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">{profile.shop.address}</p>
                <div className="flex justify-center mt-2">
                    <StarRating rating={averageRating} />
                    <span className="text-gray-500 dark:text-gray-400 ml-2">({ratingCount} reviews)</span>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-yellow-500 mb-2">Bio</h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            </Card>
            <Button onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
        </div>
        <div className="md:col-span-2 space-y-6">
             <Card>
                <h3 className="text-xl font-bold text-yellow-500 mb-4">Services</h3>
                <ul className="space-y-2">
                    {profile.services.map(s => <li key={s.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">{s.name} - ${s.price} ({s.duration} min)</li>)}
                </ul>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-yellow-500 mb-4">Portfolio</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.portfolio.map(item => (
                        <img key={item.id} src={item.url} alt={item.caption} className="w-full h-32 object-cover rounded-md" />
                    ))}
                </div>
            </Card>
        </div>
    </div>
  );
  
  const renderEditMode = () => (
      <Card>
        <div className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                    <img src={profile.profilePictureUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover"/>
                    <Button variant="secondary" onClick={() => setProfile({...profile, profilePictureUrl: `https://picsum.photos/seed/${Date.now()}/400`})} className="flex items-center gap-2">
                        <CameraIcon className="w-5 h-5" /> Change
                    </Button>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name</label>
              <Input value={profile.shop.name} onChange={e => setProfile({...profile, shop: {...profile.shop, name: e.target.value}})} />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Address</label>
              <Input value={profile.shop.address} onChange={e => setProfile({...profile, shop: {...profile.shop, address: e.target.value}})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-800 dark:text-gray-200" rows={3}></textarea>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Services</h3>
              <div className="space-y-2">
                {profile.services.map((service, index) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <Input value={service.name} onChange={e => handleServiceChange(index, 'name', e.target.value)} placeholder="Service Name"/>
                    <Input type="number" value={service.price} onChange={e => handleServiceChange(index, 'price', parseInt(e.target.value) || 0)} placeholder="Price ($)"/>
                    <Input type="number" value={service.duration} onChange={e => handleServiceChange(index, 'duration', parseInt(e.target.value) || 0)} placeholder="Duration (min)"/>
                    <Button variant="danger" onClick={() => removeService(service.id)}><XCircleIcon className="w-5 h-5"/></Button>
                  </div>
                ))}
              </div>
              <Button onClick={addService} variant="secondary" className="mt-4 flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Service</Button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Portfolio</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.portfolio.map(item => (
                        <div key={item.id} className="relative">
                            <img src={item.url} alt={item.caption} className="w-full h-32 object-cover rounded-md" />
                            <Button variant="danger" size="sm" className="absolute top-1 right-1 !p-1" onClick={() => removePortfolioItem(item.id)}>
                                <XCircleIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button onClick={addPortfolioItem} variant="secondary" className="mt-4 flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Portfolio Item</Button>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleProfileUpdate}>Save Profile</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
      </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">My Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back, {currentUser.name}!</p>
      </div>

      {isEditing ? renderEditMode() : renderViewMode()}
      
      <Card>
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">My Appointments</h2>
        <div className="space-y-4">
          {myAppointments.length > 0 ? myAppointments.map(appt => (
            <div key={appt.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="font-bold">{getServiceName(appt.barberId, appt.serviceId)}</p>
              <p>Client: {getClientName(appt.clientId)}</p>
              <p>Date: {new Date(appt.date).toLocaleString()}</p>
              <p>Status: <span className="font-semibold text-yellow-500 dark:text-yellow-400">{appt.status}</span></p>
            </div>
          )) : <p className="text-gray-500 dark:text-gray-400">You have no upcoming appointments.</p>}
        </div>
      </Card>
    </div>
  );
};

export default BarberDashboard;