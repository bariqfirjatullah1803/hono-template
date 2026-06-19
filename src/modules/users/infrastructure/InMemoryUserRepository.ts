import { IUserRepository } from "@/modules/users/domain/IUserRepository";
import { User } from "@/modules/users/domain/User";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async exists(email: string): Promise<boolean> {
    return this.users.some(user => user.email.value === email);
  }

  async save(user: User): Promise<void> {
    const alreadyExists = await this.exists(user.email.value);
    if (!alreadyExists) {
      this.users.push(user);
    } else {
      this.users = this.users.map(u => u.email.value === user.email.value ? user : u);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(user => user.email.value === email);
    return user || null;
  }
}
