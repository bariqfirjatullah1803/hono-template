export class UniqueEntityID {
  private readonly value: string | number;

  constructor(id?: string | number) {
    this.value = id ? id : Math.random().toString(36).substring(2, 15);
  }

  equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof UniqueEntityID)) {
      return false;
    }
    return id.toValue() === this.value;
  }

  toString() {
    return String(this.value);
  }

  toValue(): string | number {
    return this.value;
  }
}
