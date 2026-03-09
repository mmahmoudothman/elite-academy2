
export type UserRole = 'super_admin' | 'admin' | 'content_creator' | 'moderator' | 'instructor' | 'student';

// System users — admins, instructors, moderators, etc. who log in and manage the platform
export interface User {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  country?: string;
  role: UserRole;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
  isActive: boolean;
  lifecycleStage?: 'lead' | 'prospect' | 'enrolled' | 'active' | 'alumni' | 'inactive';
  notes?: string;
  tags?: string[];
  source?: 'website' | 'referral' | 'social' | 'ad' | 'other';
  preferredLanguage?: 'en' | 'ar';
}

// Student — a learner entity, separate from system users
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';
export type LifecycleStage = 'lead' | 'prospect' | 'enrolled' | 'active' | 'alumni' | 'inactive';
export type StudentSource = 'website' | 'referral' | 'social' | 'ad' | 'walk_in' | 'other';
export type StudentGender = 'male' | 'female';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: StudentGender;
  nationalId?: string;
  // Academic
  groupIds: string[];
  assignedInstructorId?: string;
  enrolledCourseIds: string[];
  level: StudentLevel;
  // Lifecycle
  lifecycleStage: LifecycleStage;
  // Account link (optional — if they also have a login account)
  userId?: string;
  // Meta
  isActive: boolean;
  notes?: string;
  tags?: string[];
  source?: StudentSource;
  preferredLanguage?: 'en' | 'ar';
  parentName?: string;
  parentPhone?: string;
  address?: string;
  createdAt: number;
  updatedAt: number;
}

// Student Group — cohort, class section, batch, etc.
export interface StudentGroup {
  id: string;
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  color: string;
  instructorId?: string;
  courseId?: string;
  capacity?: number;
  schedule?: string;
  startDate?: number;
  endDate?: number;
  isActive: boolean;
  studentCount: number;
  createdAt: number;
  updatedAt: number;
}

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
  capacity: number;
  duration: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  prerequisites?: string[];
  modules?: CourseModule[];
  visible?: boolean;
  createdAt?: number;
  updatedAt?: number;
  startDate?: number;
  endDate?: number;
  schedule?: string; // e.g. "Mon/Wed 6-8 PM"
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
  createdAt?: number;
  updatedAt?: number;
}

export interface Testimonial {
  id: string;
  studentName: string;
  studentRole?: string;
  content: string;
  rating: number; // 1-5
  courseId?: string;
  image?: string;
  visible: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface FAQ {
  id: string;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
  category: string;
  order: number;
  visible: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: { en: string; ar: string };
  slug: string;
  description?: { en: string; ar: string };
  icon?: string;
  color?: string;
  order: number;
  visible: boolean;
  courseCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'status_change' | 'role_change' | 'export' | 'permission_change' | 'promote' | 'demote' | 'activate' | 'deactivate';
  entityType: 'course' | 'instructor' | 'student' | 'enrollment' | 'contact' | 'testimonial' | 'faq' | 'category' | 'siteConfig' | 'auth' | 'ad' | 'user' | 'financial' | 'role' | 'permission';
  entityId?: string;
  details?: string;
  timestamp: number;
}

export interface AnalyticsEvent {
  id: string;
  eventType: 'page_view' | 'course_view' | 'enrollment_start' | 'enrollment_complete' | 'contact_submit' | 'whatsapp_click' | 'social_click' | 'cta_click' | 'search' | 'ad_impression' | 'ad_click';
  entityType?: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId?: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribedAt: number;
  source: string;
  isActive: boolean;
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
  totalStudents: number;
  totalContacts: number;
}

export type InstallmentStatus = 'upcoming' | 'due' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  dueDate: number;
  paidDate?: number;
  status: InstallmentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

export type EnrollmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'other';

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentAmount: number;
  paymentCurrency: string;
  enrolledAt: number;
  completedAt?: number;
  notes?: string;
  invoiceNumber?: string;
  discountCode?: string;
  discountAmount?: number;
  paymentDate?: number;
  paymentReference?: string;
  adminNotes?: string;
  installmentPlan?: boolean;
  installmentCount?: number;
  installments?: Installment[];
}

export type ContactStatus = 'new' | 'read' | 'responded';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  submittedAt: number;
  respondedAt?: number;
  adminNotes?: string;
  inquiryType?: string;
  sourcePage?: string;
  adminReply?: string;
}

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  facebook: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifications: {
    newRegistration: boolean;
    newEnrollment: boolean;
    newPayment: boolean;
    newContact: boolean;
  };
}

export type AdPlacement = 'banner' | 'popup' | 'sidebar' | 'inline';
export type AdStatus = 'draft' | 'active' | 'paused' | 'expired';

export interface Ad {
  id: string;
  title: { en: string; ar: string };
  content: { en: string; ar: string };
  image?: string;
  link?: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate: number;
  endDate: number;
  targetPages?: string[]; // which pages to show on
  priority: number;
  impressions: number;
  clicks: number;
  visible: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CourseFinancials {
  id: string;
  courseId: string;
  instructorPayout: number;
  venueRent?: number;
  materialsCost?: number;
  marketingCost?: number;
  otherCosts?: number;
  currency: string;
  notes?: string;
  updatedAt: number;
}

export interface SiteConfig {
  heroTitle: { en: string; ar: string };
  heroSubtitle: { en: string; ar: string };
  heroBadge: { en: string; ar: string };
  companyName: { en: string; ar: string };
  companyTagline: { en: string; ar: string };
  contactEmail: string;
  contactPhone: string;
  addresses: { label: string; value: string }[];
  socialLinks: SocialLinks;
  partners: { name: string; logo: string }[];
  footerText: { en: string; ar: string };
  announcement?: { en: string; ar: string; visible: boolean; link: string };
  whatsappMessage?: { en: string; ar: string };
  whatsappNumber?: string;
  telegram?: TelegramConfig;
  updatedAt?: number;
}
