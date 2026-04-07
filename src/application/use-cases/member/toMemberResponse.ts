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
    height: member.height,
    armSpan: member.armSpan,
    weight: member.weight,
    gender: member.gender,
    cin: member.cin,
    dateOfBirth: member.dateOfBirth?.toISOString(),
    category: member.getCategory(), // computed from DOB
    status: member.status,
    season: member.season,
    clubId: member.clubId,
    createdAt: member.createdAt,
  };
}
