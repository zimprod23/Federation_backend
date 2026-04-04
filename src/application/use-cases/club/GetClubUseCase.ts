import { IClubRepository } from "../../../domain/interfaces";
import { ClubNotFoundError } from "../../../domain/errors";
import { ClubResponseDTO } from "../../dtos";
import { toClubResponse } from "./toClubResponse";
export class GetClubUseCase {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(id: string): Promise<ClubResponseDTO> {
    const club = await this.clubRepo.findById(id);
    if (!club) throw new ClubNotFoundError(id);
    return toClubResponse(club);
  }
}
