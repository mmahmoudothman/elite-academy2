
export interface CourseModule {
  id: string;
  title: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  price: number;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD';
  rating: number;
  enrolled: number;
  duration: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  prerequisites?: string[];
  modules?: CourseModule[];
  visible?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  experience: string;
  qualifications: string[];
  bio: string;
  image: string;
  specialization: string;
  videoUrl?: string;
  visible?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  content: string;
  avatar: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalInstructors: number;
  totalEnrollments: number;
  totalRevenue: number;
}
