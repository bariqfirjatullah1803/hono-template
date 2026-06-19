import { CreateUserUseCase } from "./application/CreateUserUseCase";
import { IUserRepository } from "./domain/IUserRepository";
import { InMemoryUserRepository } from "./infrastructure/InMemoryUserRepository";
import { createUserRoutes } from "./presentation/UserRoutes";

export interface UserModuleConfig {
  userRepository?: IUserRepository;
}

export function createUserModule(config: UserModuleConfig = {}) {
  const userRepository = config.userRepository ?? new InMemoryUserRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const userRoutes = createUserRoutes({ createUserUseCase });

  return {
    userRoutes,
    createUserUseCase,
  };
}
