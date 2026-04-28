import { ClubNotFoundError } from "../../../domain/errors";
import { IClubRepository } from "../../../domain/interfaces";
import { ClubStatus } from "../../../domain/value-objects";

export class DeleteClubUseCase {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(id: string): Promise<void> {
    const club = await this.clubRepo.findById(id);
    if (!club) throw new ClubNotFoundError(id);

    // Soft delete — suspended, never hard deleted (unless its already suspended)
    if (club.status == ClubStatus.SUSPENDED) {
      await this.clubRepo.delete(id);
      return;
    }
    const suspended = club.withStatus(ClubStatus.SUSPENDED);
    await this.clubRepo.save(suspended);
  }
}
