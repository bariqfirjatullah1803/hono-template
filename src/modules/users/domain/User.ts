import { Entity } from "@/shared/domain/Entity";
import { UniqueEntityID } from "@/shared/domain/UniqueEntityID";
import { Result } from "@/shared/domain/Result";
import { UserEmail } from "./UserEmail";

interface UserProps {
  name: string;
  email: UserEmail;
}

export class User extends Entity<UserProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<User>("User name is required");
    }
    
    return Result.ok<User>(new User(props, id));
  }
}
