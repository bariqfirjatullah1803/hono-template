import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, right } from "@/shared/domain/Result";
import { IUserRepository } from "@/modules/users/domain/IUserRepository";
import { User } from "@/modules/users/domain/User";

export type GetAllUsersResponse = Either<string, Result<User[]>>;

export class GetAllUsersUseCase implements UseCase<void, GetAllUsersResponse> {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<GetAllUsersResponse> {
    const users = await this.userRepository.findAll();
    return right(Result.ok<User[]>(users));
  }
}
