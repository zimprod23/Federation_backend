import {
  ICompetitionRepository,
  IEventRepository,
} from "../../../domain/interfaces";
import { CompetitionNotFoundError } from "../../../domain/errors";
import { CompetitionResponseDTO, EventResponseDTO } from "../../dtos";
import { toCompetitionResponse } from "./toCompetitionResponse";
import { toEventResponse } from "./toEventResponse";

export interface CompetitionDetailDTO extends CompetitionResponseDTO {
  events: EventResponseDTO[];
}

export class GetCompetitionUseCase {
  constructor(
    private readonly competitionRepo: ICompetitionRepository,
    private readonly eventRepo: IEventRepository,
  ) {}

  async execute(id: string): Promise<CompetitionDetailDTO> {
    const competition = await this.competitionRepo.findById(id);
    if (!competition) throw new CompetitionNotFoundError(id);

    const events = await this.eventRepo.findByCompetitionId(id);

    return {
      ...toCompetitionResponse(competition),
      events: events.map(toEventResponse),
    };
  }
}
