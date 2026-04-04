import { UserRole } from "../../domain/value-objects";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  memberId?: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface UserResponseDTO {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
}
