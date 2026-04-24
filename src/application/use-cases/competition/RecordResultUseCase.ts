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
import { RegistrationStatus } from "../../../domain/entities/Registration";

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

    let status = dto.status;

    if (!status) {
      if (dto.rank && dto.rank > 0) {
        status = RegistrationStatus.FINISHED;
      } else if (!dto.finalTime) {
        status = RegistrationStatus.DNS;
      } else {
        status = RegistrationStatus.REGISTERED;
      }
    }

    const updated = registration.withStatus(status);
    await this.registrationRepo.save(updated);

    const AlreadyExist = await this.resultRepo.findByMemberAndEvent(
      dto.memberId,
      dto.eventId,
    );
    if (AlreadyExist) {
      const updated = new Result({
        ...AlreadyExist.toProps(),
        rank: dto.rank,
        finalTime: dto.finalTime,
        splitTime500: dto.splitTime500,
        strokeRate: dto.strokeRate,
        heartRate: dto.heartRate,
        watts: dto.watts,
        notes: dto.notes,
        recordedBy,
      });
      const saved = await this.resultRepo.save(updated);
      return toResultResponse(saved);
    }

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
