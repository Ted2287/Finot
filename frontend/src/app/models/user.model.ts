export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  lastName?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  usesTelegram?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  maritalStatus?: string;
  spouseName?: string;
  educationLevel?: string;
  graduationInstitution?: string;
  fieldOfStudy?: string;
  joinedYear?: string;
  grewUpInChildrenClass?: string;
  sundaySchoolGrade?: string;
  notStudyingReason?: string;
  serviceSubSection?: string;
  servedInOtherParish?: string;
  previousServiceSubSection?: string;
  hasFatherConfessor?: string;
  fatherConfessorName?: string;
  fatherConfessorParish?: string;
  fatherConfessorPhone?: string;
  address?: Address;
  occupation?: string;
  department?: string;
  bio?: string;
  profilePicture?: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Settings {
  _id: string;
  userId: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  userId?: { _id: string; email: string; role: string } | string | null;
  username: string;
  action: 'LOGIN' | 'LOGOUT' | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'PASSWORD_RESET' | 'PROFILE_CHANGE' | 'ACCOUNT_ACTIVATE' | 'ACCOUNT_DEACTIVATE';
  details?: any;
  ipAddress: string;
  browserInfo: string;
  createdAt: string;
}

export interface LoginHistory {
  _id: string;
  userId?: string | null;
  username: string;
  ipAddress: string;
  browserInfo: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
  createdAt: string;
}

export interface ChartTrend {
  label: string;
  value: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newRegistrations: number;
  monthlyTrends: ChartTrend[];
  loginStats: {
    success: number;
    failed: number;
  };
  educationStats: { name: string; value: number }[];
  maritalStats: { name: string; value: number }[];
  recentActivity: AuditLog[];
}
