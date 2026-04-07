import { IMemberRepository, PaginatedResult } from "../../../domain/interfaces";
import { MemberResponseDTO, ListMembersDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";

export class ListMembersUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(
    dto: ListMembersDTO,
  ): Promise<PaginatedResult<MemberResponseDTO>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const result = await this.memberRepo.findAll(
      { page, limit },
      {
        status: dto.status,
        gender: dto.gender,
        category: dto.category,
        clubId: dto.clubId,
        season: dto.season,
        search: dto.search,
      },
    );

    return {
      ...result,
      data: result.data.map(toMemberResponse),
    };
  }
}
