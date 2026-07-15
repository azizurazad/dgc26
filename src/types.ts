export interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  habitat: string;
  locationFound: string;
  description: string;
  medicinalUses?: string;
  chemicalCompounds?: string;
  collectorName: string;
  collectionDate: string;
  imageUrl: string;
  badge?: string;
}

export interface Student {
  id: string;
  full_name: string;
  name: string;
  email: string;
  roll: string;
  rollNumber: string;
  registration: string;
  registrationNumber: string;
  studentId: string;
  batch: string;
  session: string;
  profile_photo: string;
  photoUrl: string;
  role: string;
  coverUrl?: string;
  skills: string[];
  interests: string[];
  contributions: number; // Number of items curated / contributions
  badge: string; // Main badge
  bio: string;
  fbUrl?: string;
  uploadedPlants?: number;
  uploadedGalleryImages?: number;
  achievements?: string[];
  badges?: string[];
  password?: string;
  status?: 'Active' | 'Inactive';
  department?: string;
  createdDate?: string;
  isTemporaryPassword?: boolean;
  fcmToken?: string;
  fcmTokenStatus?: 'allowed' | 'blocked';
  notificationToken?: string;
  deviceType?: string;
  browser?: string;
  lastActive?: string;
  notificationEnabled?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Department Event' | 'Seminar' | 'Workshop' | 'Field Visit' | 'Laboratory' | 'Campus' | 'Botanical Tour' | 'Freshers Reception' | 'Farewell' | 'Tree Plantation' | 'Cultural Program' | 'Others';
  otherCategory?: string;
  imageUrls: string[];
  photographer: string;
  location: string;
  date: string;
  batch: string;
  rollNumber?: string;
  description: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Research Paper' | 'Field Guide' | 'Taxonomic Key' | 'Syllabus';
  author: string;
  year: string;
  size: string;
  downloadUrl: string;
}

export interface Contributor {
  id: string;
  name: string;
  role: string;
  contributionsCount: number;
  avatarUrl: string;
}

export interface AppStats {
  plantsCount: number;
  studentsCount: number;
  resourcesCount: number;
  fieldVisitsCount: number;
}

export interface AcademicNote {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  teacher: string;
  department: string;
  session: string;
  semester: string;
  subject: string;
  category: string;
  description: string;
  keywords: string[];
  pdfUrl: string;
  thumbnailUrl?: string;
  fileSize: string;
  downloadCount: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentEvent {
  id: string;
  title: string;
  subtitle: string;
  category: 'Seminar' | 'Workshop' | 'Field Visit' | 'Practical Class' | 'Research' | 'Botanical Tour' | 'Fresher Reception' | 'Farewell' | 'Cultural Program' | 'Exhibition' | 'Competition' | 'Other';
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  chiefGuest?: string;
  facultyCoordinator: string;
  batch: string;
  session: string;
  coverImage: string; // Base64 or Unsplash URL
  additionalImages: string[]; // List of Base64 strings or URLs
  youtubeUrl?: string;
  facebookLiveUrl?: string;
  participants?: {
    students: string[];
    teachers: string[];
    guests: string[];
  };
  tags: string[];
  imageType?: 'Plant Archive' | 'Department Gallery'; // Add this
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRoll: string;
  senderPhoto: string;
  senderId: string;
  message: string;
  timestamp: number;
}

export interface AppSettings {
  id: string;
  sessionYear: string;
  communityTitle: string;
  communitySubtitle: string;
  heroBgImage: string;
  heroBgBrightness: number;
  heroBgBlur: number;
  philosophyImage?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Notice' | 'Event' | 'Seminar' | 'Workshop' | 'Practical' | 'Exam' | 'Result' | 'Emergency' | 'General';
  targetAudience: 'All Students' | 'Selected Batch' | 'Selected Students';
  targetBatch?: string;
  targetStudents?: string[];
  priority: 'Low' | 'Normal' | 'High' | 'Emergency';
  scheduledDate?: string;
  imageUrl?: string;
  createdAt: number;
  readBy: string[];
  sentBy: string;
}




