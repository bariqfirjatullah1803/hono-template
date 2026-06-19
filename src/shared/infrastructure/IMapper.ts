import { UniqueEntityID } from "@/shared/domain/UniqueEntityID";

/**
 * Shared infrastructure interface for Mapper pattern
 */
export interface IMapper<DomainEntity, PersistenceModel> {
  toDomain(raw: PersistenceModel): DomainEntity;
  toPersistence(entity: DomainEntity): PersistenceModel;
}
