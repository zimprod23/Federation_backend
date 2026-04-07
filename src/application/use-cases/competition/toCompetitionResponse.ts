import { Competition } from "../../../domain/entities/Competition";
import { CompetitionResponseDTO } from "../../dtos";

export function toCompetitionResponse(c: Competition): CompetitionResponseDTO {
  return {
    id: c.id!,
    name: c.name,
    type: c.type,
    status: c.status,
    location: c.location,
    city: c.city,
    startDate: c.startDate,
    endDate: c.endDate,
    season: c.season,
    description: c.description,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
  };
}
