import { IClubRepository } from "../../../domain/interfaces";
import { ClubNotFoundError } from "../../../domain/errors";
import { ClubStatus } from "../../../domain/value-objects";
import { ClubResponseDTO } from "../../dtos";
import { toClubResponse } from "./toClubResponse";

export class UpdateClubStatusUseCase {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(id: string, status: ClubStatus): Promise<ClubResponseDTO> {
    const club = await this.clubRepo.findById(id);
    if (!club) throw new ClubNotFoundError(id);

    const updated = club.withStatus(status);
    const saved = await this.clubRepo.save(updated);
    return toClubResponse(saved);
  }
}
