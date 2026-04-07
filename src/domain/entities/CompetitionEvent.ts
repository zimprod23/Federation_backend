import {
  EventDistance,
  EventStatus,
  MemberCategory,
  Gender,
} from "../value-objects";

export interface CompetitionEventProps {
  id?: string;
  competitionId: string;
  distance: EventDistance;
  category: MemberCategory;
  gender: Gender;
  status: EventStatus;
  scheduledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompetitionEvent {
  readonly id?: string;
  readonly competitionId: string;
  readonly distance: EventDistance;
  readonly category: MemberCategory;
  readonly gender: Gender;
  readonly status: EventStatus;
  readonly scheduledAt?: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CompetitionEventProps) {
    this.id = props.id;
    this.competitionId = props.competitionId;
    this.distance = props.distance;
    this.category = props.category;
    this.gender = props.gender;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Unique label e.g. "150m Senior Men"
  get label(): string {
    const g = this.gender === "male" ? "Men" : "Women";
    return `${this.distance} ${this.category.toUpperCase()} ${g}`;
  }

  withStatus(status: EventStatus): CompetitionEvent {
    return new CompetitionEvent({ ...this.toProps(), status });
  }

  toProps(): CompetitionEventProps {
    return {
      id: this.id,
      competitionId: this.competitionId,
      distance: this.distance,
      category: this.category,
      gender: this.gender,
      status: this.status,
      scheduledAt: this.scheduledAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
