import {
  ICompetitionRepository,
  CompetitionFilters,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Competition } from "../../../../domain/entities/Competition";
import {
  CompetitionType,
  CompetitionStatus,
} from "../../../../domain/value-objects";
import {
  CompetitionModel,
  ICompetitionDocument,
} from "../models/CompetitionModel";

export class MongoCompetitionRepository implements ICompetitionRepository {
  private toDomain(doc: ICompetitionDocument): Competition {
    return new Competition({
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type as CompetitionType,
      status: doc.status as CompetitionStatus,
      location: doc.location,
      city: doc.city,
      startDate: doc.startDate,
      endDate: doc.endDate,
      season: doc.season,
      description: doc.description,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(c: Competition): Partial<ICompetitionDocument> {
    return {
      name: c.name,
      type: c.type,
      status: c.status,
      location: c.location,
      city: c.city,
      startDate: c.startDate,
      endDate: c.endDate,
      season: c.season,
      description: c.description,
      createdBy: c.createdBy,
    };
  }

  async findById(id: string): Promise<Competition | null> {
    const doc = await CompetitionModel.findById(id).lean();
    return doc ? this.toDomain(doc as ICompetitionDocument) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters: CompetitionFilters,
  ): Promise<PaginatedResult<Competition>> {
    const query: Record<string, unknown> = {};
    if (filters.status) query["status"] = filters.status;
    if (filters.season) query["season"] = filters.season;
    if (filters.type) query["type"] = filters.type;

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      CompetitionModel.find(query)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CompetitionModel.countDocuments(query),
    ]);

    return {
      data: (docs as ICompetitionDocument[]).map((d) => this.toDomain(d)),
      total,
      page,
      limit,
    };
  }

  async save(competition: Competition): Promise<Competition> {
    const data = this.toPersistence(competition);

    if (competition.id) {
      const doc = await CompetitionModel.findByIdAndUpdate(
        competition.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as ICompetitionDocument);
    }

    const doc = await CompetitionModel.create(data);
    return this.toDomain(doc as unknown as ICompetitionDocument);
  }

  async delete(id: string): Promise<void> {
    await CompetitionModel.findByIdAndDelete(id);
  }
}
