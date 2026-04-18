import {
  IMemberRepository,
  ICompetitionRepository,
  IRegistrationRepository,
  IResultRepository,
} from "../../../domain/interfaces";
import { MemberNotFoundError } from "../../../domain/errors";
import {
  MemberHistoryDTO,
  CompetitionHistoryItemDTO,
  CompetitionResultDTO,
} from "../../dtos";

export class GetMemberHistoryUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly registrationRepo: IRegistrationRepository,
    private readonly competitionRepo: ICompetitionRepository,
    private readonly resultRepo: IResultRepository,
  ) {}

  async execute(memberId: string): Promise<MemberHistoryDTO> {
    // Verify member exists
    const member = await this.memberRepo.findById(memberId);
    if (!member) throw new MemberNotFoundError(memberId);

    // Get all competitions the member participated in
    // by getting all unique competition IDs from registrations
    const allRegistrations =
      await this.registrationRepo.findByMemberId(memberId);

    const competitionIds = Array.from(
      new Set(allRegistrations.map((reg) => reg.competitionId)),
    );

    const competitionHistory: CompetitionHistoryItemDTO[] = [];
    let goldCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;

    for (const competitionId of competitionIds) {
      const competition = await this.competitionRepo.findById(competitionId);
      if (!competition) continue;

      // Get all results for this member in this competition
      const allResultsInCompetition =
        await this.resultRepo.findByCompetitionId(competitionId);
      const memberResults = allResultsInCompetition.filter(
        (r) => r.memberId === memberId,
      );

      const results: CompetitionResultDTO[] = memberResults.map((result) => {
        const medal = this.getMedalByRank(result.rank);
        if (medal === "gold") goldCount++;
        if (medal === "silver") silverCount++;
        if (medal === "bronze") bronzeCount++;

        return {
          resultId: result.id!,
          eventId: result.eventId,
          rank: result.rank,
          medal,
          finalTime: result.finalTime,
          splitTime500: result.splitTime500,
          strokeRate: result.strokeRate,
          heartRate: result.heartRate,
          watts: result.watts,
          notes: result.notes,
        };
      });

      if (results.length > 0) {
        competitionHistory.push({
          competitionId: competition.id!,
          competitionName: competition.name,
          competitionType: competition.type,
          competitionStatus: competition.status,
          location: competition.location,
          city: competition.city,
          startDate: competition.startDate,
          endDate: competition.endDate,
          season: competition.season,
          description: competition.description,
          results,
        });
      }
    }

    // Sort by start date descending (most recent first)
    competitionHistory.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );

    return {
      memberId: member.id!,
      licenseNumber: member.licenseNumber,
      fullName: member.fullName,
      totalCompetitions: competitionIds.length,
      goldMedals: goldCount,
      silverMedals: silverCount,
      bronzeMedals: bronzeCount,
      competitionHistory,
    };
  }

  private getMedalByRank(
    rank?: number,
  ): undefined | "gold" | "silver" | "bronze" {
    if (!rank) return undefined;
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return undefined;
  }
}
