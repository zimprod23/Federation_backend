import { Registration } from "../../../domain/entities/Registration";
import { RegistrationResponseDTO } from "../../dtos";

export function toRegistrationResponse(
  r: Registration,
): RegistrationResponseDTO {
  return {
    id: r.id!,
    competitionId: r.competitionId,
    eventId: r.eventId,
    memberId: r.memberId,
    clubId: r.clubId,
    status: r.status,
    lane: r.lane,
    bib: r.bib,
    registeredBy: r.registeredBy,
    createdAt: r.createdAt,
  };
}
