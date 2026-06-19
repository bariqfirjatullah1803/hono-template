import { CreateUserUseCase } from "./application/CreateUserUseCase";
import { GetAllUsersUseCase } from "./application/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "./application/GetUserByIdUseCase";
import { IUserRepository } from "./domain/IUserRepository";
import { InMemoryUserRepository } from "./infrastructure/InMemoryUserRepository";
import { createUserRoutes } from "./presentation/UserRoutes";

export interface UserModuleConfig {
  userRepository?: IUserRepository;
}

export function createUserModule(config: UserModuleConfig = {}) {
  const userRepository = config.userRepository ?? new InMemoryUserRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  const userRoutes = createUserRoutes({
    createUserUseCase,
    getAllUsersUseCase,
    getUserByIdUseCase,
  });

  return {
    userRoutes,
    createUserUseCase,
    getAllUsersUseCase,
    getUserByIdUseCase,
  };
}
