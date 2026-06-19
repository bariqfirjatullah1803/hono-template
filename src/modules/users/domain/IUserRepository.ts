import { User } from "./User";

export interface IUserRepository {
  exists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}
