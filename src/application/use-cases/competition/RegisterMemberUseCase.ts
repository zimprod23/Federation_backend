import {
  ICompetitionRepository,
  IEventRepository,
  IRegistrationRepository,
  IMemberRepository,
} from "../../../domain/interfaces";
import {
  Registration,
  RegistrationStatus,
} from "../../../domain/entities/Registration";
import {
  CompetitionNotFoundError,
  EventNotFoundError,
  MemberNotFoundError,
  AlreadyRegisteredError,
  CompetitionClosedError,
} from "../../../domain/errors";
import { CompetitionStatus, MemberStatus } from "../../../domain/value-objects";
import { ForbiddenError } from "../../../shared/errors";
import { CreateRegistrationDTO, RegistrationResponseDTO } from "../../dtos";
import { toRegistrationResponse } from "./toRegistrationResponse";

export class RegisterMemberUseCase {
  constructor(
    private readonly competitionRepo: ICompetitionRepository,
    private readonly eventRepo: IEventRepository,
    private readonly registrationRepo: IRegistrationRepository,
    private readonly memberRepo: IMemberRepository,
  ) {}

  async execute(
    dto: CreateRegistrationDTO,
    registeredBy: string,
  ): Promise<RegistrationResponseDTO> {
    // 1. Validate competition is open
    const competition = await this.competitionRepo.findById(dto.competitionId);
    if (!competition) throw new CompetitionNotFoundError(dto.competitionId);
    if (!competition.isOpen())
      throw new CompetitionClosedError(competition.name);

    // 2. Validate event exists and belongs to competition
    const event = await this.eventRepo.findById(dto.eventId);
    if (!event || event.competitionId !== dto.competitionId) {
      throw new EventNotFoundError(dto.eventId);
    }

    // 3. Validate member exists and is active
    const member = await this.memberRepo.findById(dto.memberId);
    if (!member) throw new MemberNotFoundError(dto.memberId);
    if (member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenError(
        `Member must be active to register: ${member.licenseNumber}`,
      );
    }

    // 4. Check not already registered
    const existing = await this.registrationRepo.findByMemberAndEvent(
      dto.memberId,
      dto.eventId,
    );
    if (existing) throw new AlreadyRegisteredError(dto.memberId, dto.eventId);

    // 5. Register
    const registration = new Registration({
      competitionId: dto.competitionId,
      eventId: dto.eventId,
      memberId: dto.memberId,
      clubId: member.clubId,
      status: RegistrationStatus.REGISTERED,
      registeredBy,
    });

    const saved = await this.registrationRepo.save(registration);
    return toRegistrationResponse(saved);
  }
}
