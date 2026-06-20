export interface Tour {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  category: 'popular' | 'exotic' | 'europe';
  features: string[];
  rating?: number;
  is_active?: boolean;
  created_at?: string;
  bookingDate?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  notifications?: boolean;
  newsletter?: boolean;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
  favoriteDestinations?: string[];
  bookedTours?: (Tour & { bookingId: string; bookingDate: string; bookingStatus: string })[];
}

export interface Booking {
  id: string;
  user_id: string;
  tour_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  tour?: Tour;
  user?: { id: string; name: string; email: string };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}
