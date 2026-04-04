import { IUserRepository, IPasswordHasher } from "../../../domain/interfaces";
import { User } from "../../../domain/entities/User";
import { UserAlreadyExistsError } from "../../../domain/errors";
import { CreateUserDTO, UserResponseDTO } from "../../dtos";

export class CreateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new UserAlreadyExistsError(dto.email);

    const hashed = await this.passwordHasher.hash(dto.password);

    const user = new User({
      email: dto.email,
      password: hashed,
      role: dto.role,
      memberId: dto.memberId,
      isActive: true,
    });

    const saved = await this.userRepo.save(user);

    return {
      id: saved.id!,
      email: saved.email,
      role: saved.role,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
    };
  }
}
