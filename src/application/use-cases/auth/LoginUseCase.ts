import {
  IUserRepository,
  IPasswordHasher,
  IAuthTokenService,
} from "../../../domain/interfaces";
import { InvalidCredentialsError } from "../../../domain/errors";
import { AuthResponseDTO } from "../../dtos";

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly authTokenSvc: IAuthTokenService,
  ) {}

  async execute(email: string, password: string): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.passwordHasher.compare(password, user.password);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const token = this.authTokenSvc.sign({
      userId: user.id!,
      role: user.role,
      isAdmin: user.isAdmin(),
    });

    return {
      token,
      user: {
        id: user.id!,
        email: user.email,
        role: user.role,
      },
    };
  }
}
