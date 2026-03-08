
import { Course, Testimonial, Instructor } from './types';

export const PARTNERS = [
  { name: 'Aramco', logo: 'https://logo.clearbit.com/aramco.com' },
  { name: 'NEOM', logo: 'https://www.vectorlogo.zone/logos/neom/neom-ar21.svg' },
  { name: 'Etisalat', logo: 'https://logo.clearbit.com/etisalat.ae' },
  { name: 'CIB', logo: 'https://logo.clearbit.com/cibeg.com' }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 'inst1',
    name: 'Dr. Ahmed Mansour',
    role: 'Lead Strategist',
    experience: '15+ Years Executive Experience',
    qualifications: ['PhD in Strategic Management', 'Former McKinsey Consultant', 'Member of Egypt Economic Council'],
    bio: 'Dr. Mansour specializes in digital transformation of traditional industries across Egypt and North Africa.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974',
    specialization: 'Digital Strategy',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'inst2',
    name: 'Sarah Al-Qahtani',
    role: 'Sovereign Fund Analyst',
    experience: '12 Years Wealth Management',
    qualifications: ['CFA Charterholder', 'MSc Finance (LSE)', 'Ex-Advisor to Saudi Investment Authority'],
    bio: 'Sarah provides deep analytical insights into GCC financial markets and sovereign wealth fund allocation strategies.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976',
    specialization: 'High Finance',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4'
  },
  {
    id: 'inst3',
    name: 'Eng. Omar Zayed',
    role: 'Chief Technology Officer',
    experience: '20+ Years Systems Architecture',
    qualifications: ['Stanford AI Research Fellow', 'Patented AI Solutions Specialist', 'Regional Tech Innovator Award'],
    bio: 'Omar is a pioneer in implementing machine learning models specifically designed for the linguistic and cultural context of the Arab world.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070',
    specialization: 'Artificial Intelligence',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'inst4',
    name: 'Abdalla Yasin',
    role: 'Data Analytics Instructor',
    experience: '10+ Years Data Analytics & BI',
    qualifications: ['Ph.D. Candidate in Computer Science (Fayoum University)', 'M.Sc. in Data Science', 'Power BI Instructor for DEBI & DEPI national programs'],
    bio: 'Abdalla Yasin is a seasoned freelance Data Analyst with over 10 years of experience delivering actionable insights to 70+ international clients. He serves as an Assistant Lecturer at Nahda University and is a prominent Power BI Instructor for national programs including the Digital Egypt Builders Initiative (DEBI) and the Digital Egypt Pioneers Initiative (DEPI). His expertise spans business intelligence, KPI dashboard development, data visualization, and machine learning.',
    image: '/images/abdalla-yasin.jpg',
    specialization: 'Data Analytics & Business Intelligence'
  }
];

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Executive Digital Transformation Strategy',
    category: 'Strategy',
    instructor: 'Dr. Ahmed Mansour',
    price: 8500,
    currency: 'EGP',
    rating: 4.9,
    enrolled: 1240,
    duration: '12 Weeks',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070',
    level: 'Advanced',
    description: 'A comprehensive roadmap for leaders to transition traditional business models into the digital age, focusing on regional MENA opportunities.',
    prerequisites: ['Bachelor\'s Degree', '3+ years of management experience', 'Basic understanding of digital tools'],
    modules: [
      { id: 'm1_1', title: 'Foundations of Digital Business' },
      { id: 'm1_2', title: 'Agile Leadership in MENA' },
      { id: 'm1_3', title: 'Cloud Integration & Legacy Systems' },
      { id: 'm1_4', title: 'Data-Driven Decision Making' }
    ]
  },
  {
    id: '2',
    title: 'Financial Analysis for GCC Sovereign Funds',
    category: 'Finance',
    instructor: 'Sarah Al-Qahtani',
    price: 2200,
    currency: 'SAR',
    rating: 4.8,
    enrolled: 850,
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015',
    level: 'Advanced',
    description: 'Master the complex world of institutional investment and sovereign wealth management within the Gulf Cooperation Council framework.',
    prerequisites: ['Finance or Accounting degree', 'Proficiency in Excel', 'CFA level 1 candidate preferred'],
    modules: [
      { id: 'm2_1', title: 'SWF Legal Frameworks' },
      { id: 'm2_2', title: 'Portfolio Diversification Strategies' },
      { id: 'm2_3', title: 'Risk Assessment & Mitigation' }
    ]
  },
  {
    id: '3',
    title: 'AI Architecture & Machine Learning',
    category: 'Technology',
    instructor: 'Eng. Omar Zayed',
    price: 2500,
    currency: 'AED',
    rating: 4.9,
    enrolled: 2100,
    duration: '24 Weeks',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070',
    level: 'Intermediate',
    description: 'Deep dive into neural networks and LLMs with a specific focus on Arabic Natural Language Processing and localized datasets.',
    prerequisites: ['Python proficiency', 'Basic statistics knowledge', 'Fundamental linear algebra'],
    modules: [
      { id: 'm3_1', title: 'Python for AI Fundamentals' },
      { id: 'm3_2', title: 'Neural Networks Architecture' },
      { id: 'm3_3', title: 'Arabic NLP & LLM Fine-tuning' },
      { id: 'm3_4', title: 'Ethical AI Deployment' }
    ]
  },
  {
    id: '4',
    title: 'Smart City Real Estate Investment',
    category: 'Investment',
    instructor: 'Mahmoud El-Sayed',
    price: 5200,
    currency: 'EGP',
    rating: 4.7,
    enrolled: 560,
    duration: '6 Weeks',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070',
    level: 'Intermediate',
    description: 'Analyze real estate trends in emerging MENA smart cities like NEOM and New Cairo Administrative Capital.',
    prerequisites: ['Basic real estate knowledge', 'Interest in urban planning', 'Analytical mindset'],
    modules: [
      { id: 'm4_1', title: 'Urban Planning 2.0' },
      { id: 'm4_2', title: 'PropTech Innovations' },
      { id: 'm4_3', title: 'MENA Real Estate Regulations' }
    ]
  }
];

export const CATEGORIES = ['All', 'Strategy', 'Finance', 'Technology', 'Investment', 'Management'];
