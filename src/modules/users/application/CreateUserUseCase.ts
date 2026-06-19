import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, left, right } from "@/shared/domain/Result";
import { IUserRepository } from "@/modules/users/domain/IUserRepository";
import { User } from "@/modules/users/domain/User";
import { UserEmail } from "@/modules/users/domain/UserEmail";

export interface CreateUserDTO {
  name: string;
  email: string;
}

export type CreateUserResponse = Either<
  string, // Error message
  Result<User> // Success User entity wrapped in Result
>;

export class CreateUserUseCase implements UseCase<CreateUserDTO, CreateUserResponse> {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: CreateUserDTO): Promise<CreateUserResponse> {
    const emailOrError = UserEmail.create(request.email);
    
    if (emailOrError.isFailure) {
      return left(emailOrError.errorValue());
    }

    const email = emailOrError.getValue();

    try {
      const userAlreadyExists = await this.userRepository.exists(email.value);
      if (userAlreadyExists) {
        return left(`User with email ${email.value} already exists`);
      }

      const userOrError = User.create({
        name: request.name,
        email: email
      });

      if (userOrError.isFailure) {
        return left(userOrError.errorValue());
      }

      const user = userOrError.getValue();
      await this.userRepository.save(user);

      return right(Result.ok<User>(user));
    } catch (err: any) {
      return left(err.message || "An unexpected error occurred");
    }
  }
}
