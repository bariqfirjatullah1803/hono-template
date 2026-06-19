import { UseCase } from "@/shared/application/UseCase";
import { Either, Result, left, right } from "@/shared/domain/Result";
import { IUserRepository } from "@/modules/users/domain/IUserRepository";
import { User } from "@/modules/users/domain/User";

export interface GetUserByIdDTO {
  id: string;
}

export type GetUserByIdResponse = Either<string, Result<User>>;

export class GetUserByIdUseCase implements UseCase<GetUserByIdDTO, GetUserByIdResponse> {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: GetUserByIdDTO): Promise<GetUserByIdResponse> {
    const user = await this.userRepository.findById(request.id);

    if (!user) {
      return left("User not found");
    }

    return right(Result.ok<User>(user));
  }
}
