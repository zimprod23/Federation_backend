export enum RegistrationStatus {
  REGISTERED = "registered",
  SCRATCHED = "scratched", // withdrew before event
  DNS = "dns", // did not start
  DNF = "dnf", // did not finish
  DQ = "dq", // disqualified
  FINISHED = "finished",
}

export interface RegistrationProps {
  id?: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  clubId?: string;
  status: RegistrationStatus;
  lane?: number;
  bib?: number;
  registeredBy: string; // userId who registered this member
  createdAt?: Date;
  updatedAt?: Date;
}

export class Registration {
  readonly id?: string;
  readonly competitionId: string;
  readonly eventId: string;
  readonly memberId: string;
  readonly clubId?: string;
  readonly status: RegistrationStatus;
  readonly lane?: number;
  readonly bib?: number;
  readonly registeredBy: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: RegistrationProps) {
    this.id = props.id;
    this.competitionId = props.competitionId;
    this.eventId = props.eventId;
    this.memberId = props.memberId;
    this.clubId = props.clubId;
    this.status = props.status;
    this.lane = props.lane;
    this.bib = props.bib;
    this.registeredBy = props.registeredBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  withStatus(status: RegistrationStatus): Registration {
    return new Registration({ ...this.toProps(), status });
  }

  toProps(): RegistrationProps {
    return {
      id: this.id,
      competitionId: this.competitionId,
      eventId: this.eventId,
      memberId: this.memberId,
      clubId: this.clubId,
      status: this.status,
      lane: this.lane,
      bib: this.bib,
      registeredBy: this.registeredBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
