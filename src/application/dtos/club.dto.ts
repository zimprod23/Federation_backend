import { ClubStatus, Discipline } from "../../domain/value-objects";

export interface UpdateClubStatusDTO {
  status: ClubStatus;
}

export interface CreateClubDTO {
  name: string;
  code: string;
  clubShort: string; // ← new
  region: string;
  city: string;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
}

export interface ClubResponseDTO {
  id: string;
  name: string;
  code: string;
  clubShort: string; // ← new
  region: string;
  city: string;
  status: ClubStatus;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  createdAt?: Date;
}
