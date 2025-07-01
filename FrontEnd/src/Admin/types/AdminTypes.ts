// Admin Login Request interface
export interface AdminLoginRequest {
  username: string;
  password: string;
}

// Admin Authentication Response interface  
export interface AdminAuthenticationResponse {
  token: string;
  type: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  employeeId: string;
  accessLevel: string;
  isActive: boolean;
}