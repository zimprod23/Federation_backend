import {
  ICompetitionRepository,
  IEventRepository,
  IRegistrationRepository,
  IResultRepository,
} from "../../../domain/interfaces";
import { Result } from "../../../domain/entities/Result";
import {
  CompetitionNotFoundError,
  EventNotFoundError,
  RegistrationNotFoundError,
} from "../../../domain/errors";
import { RecordResultDTO, ResultResponseDTO } from "../../dtos";
import { toResultResponse } from "./toResultResponse";

export class RecordResultUseCase {
  constructor(
    private readonly competitionRepo: ICompetitionRepository,
    private readonly eventRepo: IEventRepository,
    private readonly registrationRepo: IRegistrationRepository,
    private readonly resultRepo: IResultRepository,
  ) {}

  async execute(
    dto: RecordResultDTO,
    recordedBy: string,
  ): Promise<ResultResponseDTO> {
    // Validate references exist
    const competition = await this.competitionRepo.findById(dto.competitionId);
    if (!competition) throw new CompetitionNotFoundError(dto.competitionId);

    const event = await this.eventRepo.findById(dto.eventId);
    if (!event) throw new EventNotFoundError(dto.eventId);

    const registration = await this.registrationRepo.findById(
      dto.registrationId,
    );
    if (!registration) throw new RegistrationNotFoundError(dto.registrationId);

    const result = new Result({
      competitionId: dto.competitionId,
      eventId: dto.eventId,
      memberId: dto.memberId,
      registrationId: dto.registrationId,
      rank: dto.rank,
      finalTime: dto.finalTime,
      splitTime500: dto.splitTime500,
      strokeRate: dto.strokeRate,
      heartRate: dto.heartRate,
      watts: dto.watts,
      notes: dto.notes,
      recordedBy,
    });

    const saved = await this.resultRepo.save(result);
    return toResultResponse(saved);
  }
}
