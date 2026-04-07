import { CompetitionEvent } from "../../../domain/entities/CompetitionEvent";
import { EventResponseDTO } from "../../dtos";

export function toEventResponse(e: CompetitionEvent): EventResponseDTO {
  return {
    id: e.id!,
    competitionId: e.competitionId,
    distance: e.distance,
    category: e.category,
    gender: e.gender,
    status: e.status,
    label: e.label,
    scheduledAt: e.scheduledAt,
    createdAt: e.createdAt,
  };
}
