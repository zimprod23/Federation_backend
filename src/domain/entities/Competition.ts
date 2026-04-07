import { CompetitionType, CompetitionStatus } from "../value-objects";

export interface CompetitionProps {
  id?: string;
  name: string;
  type: CompetitionType;
  status: CompetitionStatus;
  location: string;
  city: string;
  startDate: Date;
  endDate: Date;
  season: number;
  description?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Competition {
  readonly id?: string;
  readonly name: string;
  readonly type: CompetitionType;
  readonly status: CompetitionStatus;
  readonly location: string;
  readonly city: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly season: number;
  readonly description?: string;
  readonly createdBy: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CompetitionProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.status = props.status;
    this.location = props.location;
    this.city = props.city;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.season = props.season;
    this.description = props.description;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOpen(): boolean {
    return this.status === CompetitionStatus.OPEN;
  }

  withStatus(status: CompetitionStatus): Competition {
    return new Competition({ ...this.toProps(), status });
  }

  toProps(): CompetitionProps {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      location: this.location,
      city: this.city,
      startDate: this.startDate,
      endDate: this.endDate,
      season: this.season,
      description: this.description,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
