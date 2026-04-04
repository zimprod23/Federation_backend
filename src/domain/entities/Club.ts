import { ClubStatus, Discipline } from "../value-objects";

export interface ClubProps {
  id?: string;
  name: string;
  code: string;
  region: string;
  city: string;
  status: ClubStatus;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Club {
  readonly id?: string;
  readonly name: string;
  readonly code: string;
  readonly region: string;
  readonly city: string;
  readonly status: ClubStatus;
  readonly disciplines: Discipline[];
  readonly presidentName?: string;
  readonly presidentEmail?: string;
  readonly presidentPhone?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ClubProps) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code.toUpperCase();
    this.region = props.region;
    this.city = props.city;
    this.status = props.status;
    this.disciplines = props.disciplines;
    this.presidentName = props.presidentName;
    this.presidentEmail = props.presidentEmail;
    this.presidentPhone = props.presidentPhone;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isActive(): boolean {
    return this.status === ClubStatus.ACTIVE;
  }

  withStatus(status: ClubStatus): Club {
    return new Club({ ...this.toProps(), status });
  }

  toProps(): ClubProps {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      region: this.region,
      city: this.city,
      status: this.status,
      disciplines: this.disciplines,
      presidentName: this.presidentName,
      presidentEmail: this.presidentEmail,
      presidentPhone: this.presidentPhone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
