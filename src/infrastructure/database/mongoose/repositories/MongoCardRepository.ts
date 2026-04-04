import { Types, QueryFilter } from "mongoose";
import { ICardRepository } from "../../../../domain/interfaces";
import { MembershipCard } from "../../../../domain/entities/MembershipCard";
import {
  MembershipCardModel,
  IMembershipCardDocument,
} from "../models/MemberShipCardModel";

export class MongoCardRepository implements ICardRepository {
  private toDomain(doc: IMembershipCardDocument): MembershipCard {
    return new MembershipCard({
      id: doc._id.toString(),
      memberId: doc.memberId.toString(),
      licenseNumber: doc.licenseNumber,
      season: doc.season,
      cardNumber: doc.cardNumber,
      pdfUrl: doc.pdfUrl,
      qrPayload: doc.qrPayload,
      isValid: doc.isValid,
      validFrom: doc.validFrom, // ← new
      validUntil: doc.validUntil, // ← new
      generatedAt: doc.generatedAt,
      downloadedAt: doc.downloadedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(
    card: MembershipCard,
  ): Partial<IMembershipCardDocument> {
    return {
      memberId: new Types.ObjectId(card.memberId) as Types.ObjectId,
      licenseNumber: card.licenseNumber,
      season: card.season,
      cardNumber: card.cardNumber,
      pdfUrl: card.pdfUrl,
      qrPayload: card.qrPayload,
      isValid: card.isValid,
      validFrom: card.validFrom, // ← new
      validUntil: card.validUntil, // ← new
      generatedAt: card.generatedAt ?? new Date(),
      downloadedAt: card.downloadedAt,
    };
  }

  async findByMemberId(
    memberId: string,
    season?: number,
  ): Promise<MembershipCard | null> {
    const query: QueryFilter<IMembershipCardDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
      isValid: true,
    };
    if (season !== undefined) query["season"] = season;

    const doc = await MembershipCardModel.findOne(query)
      .sort({ generatedAt: -1 })
      .lean();

    return doc ? this.toDomain(doc as IMembershipCardDocument) : null;
  }

  async findByQrPayload(qrPayload: string): Promise<MembershipCard | null> {
    const doc = await MembershipCardModel.findOne({ qrPayload }).lean();
    return doc ? this.toDomain(doc as IMembershipCardDocument) : null;
  }

  async save(card: MembershipCard): Promise<MembershipCard> {
    const data = this.toPersistence(card);

    if (card.id) {
      const doc = await MembershipCardModel.findByIdAndUpdate(
        card.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IMembershipCardDocument);
    }

    const doc = await MembershipCardModel.create(data);
    return this.toDomain(doc as unknown as IMembershipCardDocument);
  }

  async invalidatePrevious(memberId: string, season: number): Promise<void> {
    const filter: QueryFilter<IMembershipCardDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
      season,
      isValid: true,
    };

    await MembershipCardModel.updateMany(filter, { $set: { isValid: false } });
  }
}
