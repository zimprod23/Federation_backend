import {
  IEventRepository,
  IResultRepository,
  IMemberRepository,
} from "../../../domain/interfaces";
import { EventNotFoundError } from "../../../domain/errors";
import { ResultResponseDTO } from "../../dtos";
import { toResultResponse } from "./toResultResponse";

export interface EventResultDTO extends ResultResponseDTO {
  memberFullName: string;
  memberLicenseNumber: string;
}

export class GetEventResultsUseCase {
  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly resultRepo: IResultRepository,
    private readonly memberRepo: IMemberRepository,
  ) {}

  async execute(eventId: string): Promise<EventResultDTO[]> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new EventNotFoundError(eventId);

    const results = await this.resultRepo.findByEventId(eventId);

    // Enrich with member info
    const enriched = await Promise.all(
      results.map(async (result) => {
        const member = await this.memberRepo.findById(result.memberId);
        return {
          ...toResultResponse(result),
          memberFullName: member?.fullName ?? "Unknown",
          memberLicenseNumber: member?.licenseNumber ?? "Unknown",
        };
      }),
    );

    return enriched;
  }
}
