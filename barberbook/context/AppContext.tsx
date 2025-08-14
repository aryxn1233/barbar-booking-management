import React, { createContext, useState, useEffect } from 'react';
import { Role, User, Appointment, BarberProfile, Service, PortfolioItem } from '../types';

type Theme = 'light' | 'dark';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  appointments: Appointment[];
  barberProfiles: BarberProfile[];
  theme: Theme;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: Role) => Promise<User>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'rating' | 'review'>) => Promise<void>;
  updateUserStatus: (userId: string, updates: { isBanned?: boolean; isApproved?: boolean }) => Promise<void>;
  updateBarberProfile: (profile: BarberProfile) => Promise<void>;
  getBarberName: (id: string) => string;
  getClientName: (id: string) => string;
  getServiceName: (barberId: string, serviceId: string) => string;
  updateAppointmentRating: (appointmentId: string, rating: number, review: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [barberProfiles, setBarberProfiles] = useState<BarberProfile[]>(initialBarberProfiles);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          if (user.isBanned) {
            reject(new Error('This account has been banned.'));
          } else if (user.role === Role.BARBER && !user.isApproved) {
            reject(new Error('Your account is pending approval by an administrator.'));
          } else {
            setCurrentUser(user);
            resolve(user);
          }
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (name: string, email: string, password: string, role: Role): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users.some(u => u.email === email)) {
          reject(new Error('An account with this email already exists.'));
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role,
          isBanned: false,
          isApproved: role !== Role.BARBER, // Barbers need approval
        };

        setUsers(prev => [...prev, newUser]);

        if (role === Role.BARBER) {
          const newProfile: BarberProfile = {
            userId: newUser.id,
            bio: 'New barber ready to provide great haircuts!',
            services: [],
            profilePictureUrl: `https://picsum.photos/seed/${newUser.id}/400`,
            shop: {
                name: `${name}'s Shop`,
                address: "Please update your address",
                location: { lat: 40.7128, lng: -74.0060 }
            },
            portfolio: [],
          };
          setBarberProfiles(prev => [...prev, newProfile]);
        }
        
        resolve(newUser);
      }, 500);
    });
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status' | 'rating' | 'review'>): Promise<void> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const newAppointment: Appointment = {
                  ...appointmentData,
                  id: `appt-${Date.now()}`,
                  status: 'Scheduled',
              };
              setAppointments(prev => [...prev, newAppointment]);
              resolve();
          }, 500);
      });
  };

  const updateUserStatus = async (userId: string, updates: { isBanned?: boolean; isApproved?: boolean }): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === userId ? { ...user, ...updates } : user
            ));
            resolve();
        }, 300);
    });
  };

  const updateBarberProfile = async (profile: BarberProfile): Promise<void> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              setBarberProfiles(prevProfiles => prevProfiles.map(p => 
                  p.userId === profile.userId ? profile : p
              ));
              resolve();
          }, 500);
      });
  };
  
  const updateAppointmentRating = async (appointmentId: string, rating: number, review: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            setAppointments(prev => prev.map(appt => 
                appt.id === appointmentId ? { ...appt, rating, review } : appt
            ));
            resolve();
        }, 300);
    });
  };

  const getBarberName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown Barber';
  const getClientName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown Client';
  const getServiceName = (barberId: string, serviceId: string) => {
      const profile = barberProfiles.find(p => p.userId === barberId);
      return profile?.services.find(s => s.id === serviceId)?.name ?? 'Unknown Service';
  };

  return (
    <AppContext.Provider value={{ currentUser, users, appointments, barberProfiles, theme, toggleTheme, login, logout, register, addAppointment, updateUserStatus, updateBarberProfile, getBarberName, getClientName, getServiceName, updateAppointmentRating }}>
      {children}
    </AppContext.Provider>
  );
};


// MOCK DATA
const initialAdminUser: User = { id: 'admin1', name: 'Admin', email: 'admin@.com', password: 'password', role: Role.ADMIN, isBanned: false, isApproved: true };
const initialBarberUser1: User = { id: 'barber1', name: 'Edward Scissorhands', email: 'edward@barberbook.com', password: 'password', role: Role.BARBER, isBanned: false, isApproved: true };
const initialBarberUser2: User = { id: 'barber2', name: 'Sweeney Todd', email: 'sweeney@barberbook.com', password: 'password', role: Role.BARBER, isBanned: false, isApproved: true };
const initialBarberUser3: User = { id: 'barber3', name: 'Pending Pete', email: 'pete@barberbook.com', password: 'password', role: Role.BARBER, isBanned: false, isApproved: false };
const initialClientUser1: User = { id: 'client1', name: 'John Doe', email: 'john@email.com', password: 'password', role: Role.CLIENT, isBanned: false, isApproved: true };
const initialClientUser2: User = { id: 'client2', name: 'Jane Smith', email: 'jane@email.com', password: 'password', role: Role.CLIENT, isBanned: true, isApproved: true };

export const initialUsers: User[] = [initialAdminUser, initialBarberUser1, initialBarberUser2, initialBarberUser3, initialClientUser1, initialClientUser2];

const services1: Service[] = [
    { id: 's1-1', name: 'Classic Cut', price: 30, duration: 30 },
    { id: 's1-2', name: 'Beard Trim', price: 15, duration: 15 },
    { id: 's1-3', name: 'Hot Towel Shave', price: 40, duration: 45 },
];

const services2: Service[] = [
    { id: 's2-1', name: 'Modern Fade', price: 35, duration: 40 },
    { id: 's2-2', name: 'The Full Works', price: 60, duration: 60 },
];

export const initialBarberProfiles: BarberProfile[] = [
    { 
        userId: 'barber1', 
        bio: 'Master of classic and modern styles. 15 years of experience creating sharp, stylish looks for discerning clients. I believe a good haircut is the best accessory.', 
        services: services1, 
        profilePictureUrl: 'https://picsum.photos/seed/edward/400',
        shop: { name: "Edward's Edge", address: '123 Main St, New York, NY', location: { lat: 40.7128, lng: -74.0060 } },
        portfolio: [
            { id: 'p1-1', type: 'image', url: 'https://picsum.photos/seed/work1/400', caption: 'Clean fade' },
            { id: 'p1-2', type: 'image', url: 'https://picsum.photos/seed/work2/400', caption: 'Sharp beard trim' },
            { id: 'p1-3', type: 'image', url: 'https://picsum.photos/seed/workA/400', caption: 'Classic Pompadour' },
            { id: 'p1-4', type: 'image', url: 'https://picsum.photos/seed/workB/400', caption: 'Textured Crop' },
        ]
    },
    { 
        userId: 'barber2', 
        bio: 'Specializing in the closest shaves you\'ve ever had. A true artist with a razor. Come for the shave, stay for the immaculate vibes.', 
        services: services2, 
        profilePictureUrl: 'https://picsum.photos/seed/sweeney/400',
        shop: { name: "Sweeney's Cuts", address: '456 Fleet St, Los Angeles, CA', location: { lat: 34.0522, lng: -118.2437 } },
        portfolio: [
             { id: 'p2-1', type: 'image', url: 'https://picsum.photos/seed/work3/400', caption: 'The closest shave' },
             { id: 'p2-2', type: 'image', url: 'https://picsum.photos/seed/workC/400', caption: 'Precision Line-up' },
        ]
    },
    { 
        userId: 'barber3', 
        bio: 'Eager to start and show my skills!', 
        services: [], 
        profilePictureUrl: 'https://picsum.photos/seed/pete/400',
        shop: { name: "Pete's Place", address: '789 Pending Ave, Chicago, IL', location: { lat: 41.8781, lng: -87.6298 } },
        portfolio: []
    },
];

export const initialAppointments: Appointment[] = [
    { id: 'appt1', clientId: 'client1', barberId: 'barber1', serviceId: 's1-1', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Scheduled' },
    { id: 'appt2', clientId: 'client1', barberId: 'barber1', serviceId: 's1-2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Completed', rating: 5, review: 'Edward was amazing! Best haircut of my life.' },
    { id: 'appt3', clientId: 'client1', barberId: 'barber2', serviceId: 's2-1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Completed', rating: 4, review: 'Great shave, very precise.' },
];