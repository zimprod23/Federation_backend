import { Result } from "../../../domain/entities/Result";
import { ResultResponseDTO } from "../../dtos";

export function toResultResponse(r: Result): ResultResponseDTO {
  return {
    id: r.id!,
    competitionId: r.competitionId,
    eventId: r.eventId,
    memberId: r.memberId,
    registrationId: r.registrationId,
    rank: r.rank,
    finalTime: r.finalTime,
    splitTime500: r.splitTime500,
    strokeRate: r.strokeRate,
    heartRate: r.heartRate,
    watts: r.watts,
    notes: r.notes,
    recordedBy: r.recordedBy,
    createdAt: r.createdAt,
  };
}
