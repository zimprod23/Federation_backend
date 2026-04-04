import { IMemberRepository, IStorageService } from "../../../domain/interfaces";
import { MemberNotFoundError } from "../../../domain/errors";
import { MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";

export class UploadMemberPhotoUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    id: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<MemberResponseDTO> {
    const member = await this.memberRepo.findById(id);
    if (!member) throw new MemberNotFoundError(id);

    const ext = mimeType.split("/")[1] ?? "jpg";
    const key = `members/${id}/photo.${ext}`;
    const photoUrl = await this.storageService.upload(key, buffer, mimeType);

    const updated = member.withPhoto(photoUrl);
    const saved = await this.memberRepo.save(updated);
    return toMemberResponse(saved);
  }
}
