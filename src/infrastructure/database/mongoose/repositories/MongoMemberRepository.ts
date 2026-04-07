import {
  IMemberRepository,
  MemberFilters,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Member } from "../../../../domain/entities/Member";
import {
  Discipline,
  Gender,
  MemberLevel,
  MemberStatus,
} from "../../../../domain/value-objects";
import { MemberModel, IMemberDocument } from "../models/MemberModel";
import { CounterModel } from "../models/CounterModel";

export class MongoMemberRepository implements IMemberRepository {
  private toDomain(doc: IMemberDocument): Member {
    return new Member({
      id: doc._id.toString(),
      licenseNumber: doc.licenseNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      dateOfBirth: doc.dateOfBirth,
      gender: doc.gender as Gender,
      email: doc.email,
      phone: doc.phone,
      photoUrl: doc.photoUrl,
      height: doc.height,
      armSpan: doc.armSpan,
      weight: doc.weight,
      cin: doc.cin,
      // disciplines: doc.disciplines as Discipline[],
      // level: doc.level as MemberLevel,
      status: doc.status as MemberStatus,
      clubId: doc.clubId?.toString(),
      season: doc.season,
      qrToken: doc.qrToken,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(member: Member): Partial<IMemberDocument> {
    return {
      licenseNumber: member.licenseNumber,
      firstName: member.firstName,
      lastName: member.lastName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      email: member.email,
      phone: member.phone,
      photoUrl: member.photoUrl,
      height: member.height,
      armSpan: member.armSpan,
      weight: member.weight,
      cin: member.cin,
      // disciplines: member.disciplines,
      // level: member.level,
      status: member.status,
      clubId: member.clubId as unknown as Schema.Types.ObjectId,
      season: member.season,
      qrToken: member.qrToken,
    };
  }

  async findById(id: string): Promise<Member | null> {
    const doc = await MemberModel.findById(id).lean();
    return doc ? this.toDomain(doc as IMemberDocument) : null;
  }

  async findByLicenseNumber(ln: string): Promise<Member | null> {
    const doc = await MemberModel.findOne({ licenseNumber: ln }).lean();
    return doc ? this.toDomain(doc as IMemberDocument) : null;
  }

  async findByEmail(email: string): Promise<Member | null> {
    const doc = await MemberModel.findOne({
      email: email.toLowerCase(),
    }).lean();
    return doc ? this.toDomain(doc as IMemberDocument) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters: MemberFilters,
  ): Promise<PaginatedResult<Member>> {
    const query: Record<string, unknown> = {};

    if (filters.status) query["status"] = filters.status;
    if (filters.gender) query["gender"] = filters.gender;
    if (filters.clubId) query["clubId"] = filters.clubId;
    if (filters.season) query["season"] = filters.season;
    if (filters.search) query["$text"] = { $search: filters.search };

    // category is computed from DOB — filter in memory after fetch
    // for now we skip DB-level category filtering (add later with aggregation)

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      MemberModel.find(query).skip(skip).limit(limit).lean(),
      MemberModel.countDocuments(query),
    ]);

    return {
      data: (docs as IMemberDocument[]).map((d) => this.toDomain(d)),
      total,
      page,
      limit,
    };
  }

  async nextSequence(year: number): Promise<number> {
    const counter = await CounterModel.findByIdAndUpdate(
      `member_seq_${year}`,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return counter!.seq;
  }

  async save(member: Member): Promise<Member> {
    const data = this.toPersistence(member);

    if (member.id) {
      const doc = await MemberModel.findByIdAndUpdate(
        member.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IMemberDocument);
    }

    const doc = await MemberModel.create(data);
    return this.toDomain(doc as unknown as IMemberDocument);
  }

  async delete(id: string): Promise<void> {
    await MemberModel.findByIdAndDelete(id);
  }
}

import { Schema } from "mongoose";
