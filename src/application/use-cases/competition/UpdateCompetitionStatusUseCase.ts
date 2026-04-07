import { ICompetitionRepository } from "../../../domain/interfaces";
import { CompetitionNotFoundError } from "../../../domain/errors";
import { CompetitionStatus } from "../../../domain/value-objects";
import { CompetitionResponseDTO } from "../../dtos";
import { toCompetitionResponse } from "./toCompetitionResponse";

export class UpdateCompetitionStatusUseCase {
  constructor(private readonly competitionRepo: ICompetitionRepository) {}

  async execute(
    id: string,
    status: CompetitionStatus,
  ): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepo.findById(id);
    if (!competition) throw new CompetitionNotFoundError(id);

    const updated = competition.withStatus(status);
    const saved = await this.competitionRepo.save(updated);
    return toCompetitionResponse(saved);
  }
}
