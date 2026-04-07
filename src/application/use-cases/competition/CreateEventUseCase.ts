import {
  ICompetitionRepository,
  IEventRepository,
} from "../../../domain/interfaces";
import { CompetitionEvent } from "../../../domain/entities/CompetitionEvent";
import { CompetitionNotFoundError } from "../../../domain/errors";
import { CompetitionClosedError } from "../../../domain/errors";
import { EventStatus, CompetitionStatus } from "../../../domain/value-objects";
import { CreateEventDTO, EventResponseDTO } from "../../dtos";
import { toEventResponse } from "./toEventResponse";

export class CreateEventUseCase {
  constructor(
    private readonly competitionRepo: ICompetitionRepository,
    private readonly eventRepo: IEventRepository,
  ) {}

  async execute(dto: CreateEventDTO): Promise<EventResponseDTO> {
    const competition = await this.competitionRepo.findById(dto.competitionId);
    if (!competition) throw new CompetitionNotFoundError(dto.competitionId);

    if (competition.status === CompetitionStatus.COMPLETED) {
      throw new CompetitionClosedError(competition.name);
    }

    const event = new CompetitionEvent({
      competitionId: dto.competitionId,
      distance: dto.distance,
      category: dto.category,
      gender: dto.gender,
      status: EventStatus.SCHEDULED,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    const saved = await this.eventRepo.save(event);
    return toEventResponse(saved);
  }
}
