import { IUserRepository } from "../../../domain/interfaces";
import { UserNotFoundError } from "../../../domain/errors";
import { UserResponseDTO } from "../../dtos";

export class GetMeUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    return {
      id: user.id!,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
