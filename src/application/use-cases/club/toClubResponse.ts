import { Club } from "../../../domain/entities/Club";
import { ClubResponseDTO } from "../../dtos";

export function toClubResponse(club: Club): ClubResponseDTO {
  return {
    id: club.id!,
    name: club.name,
    code: club.code,
    region: club.region,
    city: club.city,
    status: club.status,
    disciplines: club.disciplines,
    presidentName: club.presidentName,
    presidentEmail: club.presidentEmail,
    createdAt: club.createdAt,
  };
}
