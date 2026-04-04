import { ClubStatus, Discipline } from "../../domain/value-objects";

export interface CreateClubDTO {
  name: string;
  code: string;
  region: string;
  city: string;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
}

export interface UpdateClubStatusDTO {
  status: ClubStatus;
}

export interface ClubResponseDTO {
  id: string;
  name: string;
  code: string;
  region: string;
  city: string;
  status: ClubStatus;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  createdAt?: Date;
}
