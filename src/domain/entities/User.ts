import { UserRole } from "../value-objects";

export interface UserProps {
  id?: string;
  email: string;
  password: string; // always hashed, never plain text
  role: UserRole;
  memberId?: string; // set when role = "member"
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id?: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
  readonly memberId?: string;
  readonly isActive: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.memberId = props.memberId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isAdmin(): boolean {
    return this.role === "super_admin" || this.role === "federation_admin";
  }

  withStatus(isActive: boolean): User {
    return new User({ ...this.toProps(), isActive });
  }

  toProps(): UserProps {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role,
      memberId: this.memberId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
