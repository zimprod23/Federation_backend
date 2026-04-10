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
  PositionType,
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
      position: doc.position as PositionType,
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
      position: member.position,
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

  async findByCin(cin: string): Promise<Member | null> {
    const doc = await MemberModel.findOne({ cin }).lean();
    return doc ? this.toDomain(doc as IMemberDocument) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters: MemberFilters,
  ): Promise<PaginatedResult<Member>> {
    const query: Record<string, any> = {};

    if (filters.status) query["status"] = filters.status;
    if (filters.gender) query["gender"] = filters.gender;
    if (filters.clubId) query["clubId"] = filters.clubId;
    if (filters.season) query["season"] = filters.season;

    // Change from $text to $or with $regex for partial matching
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i"); // 'i' for case-insensitive
      query["$or"] = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { licenseNumber: searchRegex },
        { cin: searchRegex }, // Added CIN as it's useful for searching members
      ];
    }

    if (filters.category) {
      const currentYear = new Date().getFullYear();
      let minYear: number, maxYear: number;

      // Example logic for categories based on birth year
      switch (filters.category) {
        case "u15":
          minYear = currentYear - 14;
          maxYear = currentYear;
          break;
        case "u19":
          minYear = currentYear - 18;
          maxYear = currentYear - 15;
          break;
        case "junior":
          minYear = currentYear - 20;
          maxYear = currentYear - 19;
          break;
        case "u23":
          minYear = currentYear - 22;
          maxYear = currentYear - 21;
          break;
        case "senior":
          minYear = 1900; // or 0
          maxYear = currentYear - 23;
          break;
        default:
          minYear = 0;
          maxYear = 3000;
      }

      query["dateOfBirth"] = {
        $gte: new Date(`${minYear}-01-01`),
        $lte: new Date(`${maxYear}-12-31`),
      };
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      MemberModel.find(query)
        .sort({ createdAt: -1 }) // Usually better to see newest first
        .skip(skip)
        .limit(limit)
        .lean(),
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
