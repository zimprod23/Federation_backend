import { Member } from "../../../domain/entities/Member";
import { MemberResponseDTO } from "../../dtos";

export function toMemberResponse(member: Member): MemberResponseDTO {
  return {
    id: member.id!,
    licenseNumber: member.licenseNumber,
    fullName: member.fullName,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    photoUrl: member.photoUrl,
    disciplines: member.disciplines,
    level: member.level,
    status: member.status,
    season: member.season,
    clubId: member.clubId,
    createdAt: member.createdAt,
  };
}
