import { IClubRepository, PaginatedResult } from "../../../domain/interfaces";
import { ClubResponseDTO } from "../../dtos";
import { toClubResponse } from "./toClubResponse";

export class ListClubsUseCase {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<ClubResponseDTO>> {
    const result = await this.clubRepo.findAll({ page, limit });

    return {
      ...result,
      data: result.data.map(toClubResponse),
    };
  }
}
