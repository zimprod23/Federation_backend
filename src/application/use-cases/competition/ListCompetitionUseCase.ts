import {
  ICompetitionRepository,
  PaginatedResult,
} from "../../../domain/interfaces";
import { ListCompetitionsDTO, CompetitionResponseDTO } from "../../dtos";
import { toCompetitionResponse } from "./toCompetitionResponse";

export class ListCompetitionsUseCase {
  constructor(private readonly competitionRepo: ICompetitionRepository) {}

  async execute(
    dto: ListCompetitionsDTO,
  ): Promise<PaginatedResult<CompetitionResponseDTO>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const result = await this.competitionRepo.findAll(
      { page, limit },
      {
        status: dto.status,
        season: dto.season,
        type: dto.type,
      },
    );

    return {
      ...result,
      data: result.data.map(toCompetitionResponse),
    };
  }
}
