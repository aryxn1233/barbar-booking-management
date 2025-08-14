
export enum Role {
  CLIENT = 'Client',
  BARBER = 'Barber',
  ADMIN = 'Admin',
}

export interface PortfolioItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored in client state long-term
  role: Role;
  isBanned: boolean;
  isApproved: boolean; // Relevant for Barbers
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface BarberProfile {
  userId: string;
  bio: string;
  services: Service[];
  profilePictureUrl: string; // Renamed
  portfolio: PortfolioItem[];
  shop: {
      name: string;
      address: string;
      location: { lat: number, lng: number };
  };
}

export interface Appointment {
  id:string;
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string; // ISO string for simplicity
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  rating?: number; // 1-5 stars
  review?: string;
}
