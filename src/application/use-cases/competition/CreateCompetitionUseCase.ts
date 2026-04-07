import { ICompetitionRepository } from "../../../domain/interfaces";
import { Competition } from "../../../domain/entities/Competition";
import { CompetitionStatus } from "../../../domain/value-objects";
import { CreateCompetitionDTO, CompetitionResponseDTO } from "../../dtos";
import { toCompetitionResponse } from "./toCompetitionResponse";

export class CreateCompetitionUseCase {
  constructor(private readonly competitionRepo: ICompetitionRepository) {}

  async execute(
    dto: CreateCompetitionDTO,
    createdBy: string,
  ): Promise<CompetitionResponseDTO> {
    const competition = new Competition({
      name: dto.name,
      type: dto.type,
      status: CompetitionStatus.DRAFT,
      location: dto.location,
      city: dto.city,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      season: dto.season,
      description: dto.description,
      createdBy,
    });

    const saved = await this.competitionRepo.save(competition);
    return toCompetitionResponse(saved);
  }
}
