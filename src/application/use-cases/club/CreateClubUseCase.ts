import { IClubRepository } from "../../../domain/interfaces";
import { Club } from "../../../domain/entities/Club";
import { ClubAlreadyExistsError } from "../../../domain/errors";
import { ClubStatus } from "../../../domain/value-objects";
import { CreateClubDTO, ClubResponseDTO } from "../../dtos";
import { toClubResponse } from "./toClubResponse";
export class CreateClubUseCase {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(dto: CreateClubDTO): Promise<ClubResponseDTO> {
    const existing = await this.clubRepo.findByCode(dto.code);
    if (existing) throw new ClubAlreadyExistsError(dto.code);

    const club = new Club({
      name: dto.name,
      code: dto.code,
      region: dto.region,
      city: dto.city,
      disciplines: dto.disciplines,
      status: ClubStatus.PENDING,
      presidentName: dto.presidentName,
      presidentEmail: dto.presidentEmail,
      presidentPhone: dto.presidentPhone,
    });

    const saved = await this.clubRepo.save(club);
    return toClubResponse(saved);
  }
}
