// src/application/use-cases/competition/DeleteCompetitionUseCase.ts

import {
  ICompetitionRepository,
  IEventRepository,
  IRegistrationRepository,
  IResultRepository,
} from "../../../domain/interfaces";
import { CompetitionNotFoundError } from "../../../domain/errors";
import { CompetitionStatus } from "../../../domain/value-objects";
import { ConflictError } from "../../../shared/errors";

export class DeleteCompetitionUseCase {
  constructor(
    private readonly competitionRepo: ICompetitionRepository,
    private readonly eventRepo: IEventRepository,
    private readonly registrationRepo: IRegistrationRepository,
    private readonly resultRepo: IResultRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const competition = await this.competitionRepo.findById(id);
    if (!competition) throw new CompetitionNotFoundError(id);

    // Business Rule: Cannot delete a completed competition
    if (competition.status === CompetitionStatus.COMPLETED) {
      throw new ConflictError("Cannot delete a completed competition");
    }

    // 1. Find all events associated with this competition
    const events = await this.eventRepo.findByCompetitionId(id);

    // 2. Cascade delete for each event (Results -> Registrations -> Events)
    for (const event of events) {
      if (event.id) {
        await this.resultRepo.deleteByEventId(event.id);
        await this.registrationRepo.deleteByEventId(event.id);
        await this.eventRepo.delete(event.id);
      }
    }

    // 3. Finally, delete the competition
    await this.competitionRepo.delete(id);
  }
}
