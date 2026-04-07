export interface ResultProps {
  id?: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  registrationId: string;
  rank?: number;
  finalTime?: string; // "MM:SS.ms" e.g. "06:32.4"
  splitTime500?: string; // split per 500m
  strokeRate?: number; // strokes per minute
  heartRate?: number; // average HR bpm
  watts?: number; // average watts
  notes?: string;
  recordedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Result {
  readonly id?: string;
  readonly competitionId: string;
  readonly eventId: string;
  readonly memberId: string;
  readonly registrationId: string;
  readonly rank?: number;
  readonly finalTime?: string;
  readonly splitTime500?: string;
  readonly strokeRate?: number;
  readonly heartRate?: number;
  readonly watts?: number;
  readonly notes?: string;
  readonly recordedBy: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ResultProps) {
    this.id = props.id;
    this.competitionId = props.competitionId;
    this.eventId = props.eventId;
    this.memberId = props.memberId;
    this.registrationId = props.registrationId;
    this.rank = props.rank;
    this.finalTime = props.finalTime;
    this.splitTime500 = props.splitTime500;
    this.strokeRate = props.strokeRate;
    this.heartRate = props.heartRate;
    this.watts = props.watts;
    this.notes = props.notes;
    this.recordedBy = props.recordedBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toProps(): ResultProps {
    return {
      id: this.id,
      competitionId: this.competitionId,
      eventId: this.eventId,
      memberId: this.memberId,
      registrationId: this.registrationId,
      rank: this.rank,
      finalTime: this.finalTime,
      splitTime500: this.splitTime500,
      strokeRate: this.strokeRate,
      heartRate: this.heartRate,
      watts: this.watts,
      notes: this.notes,
      recordedBy: this.recordedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
