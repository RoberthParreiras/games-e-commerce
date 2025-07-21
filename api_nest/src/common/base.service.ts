export abstract class BaseService {
  protected prepareUpdateData<T extends object>(
    changedFields: Partial<T>,
  ): T & { updatedAt: Date } {
    return {
      ...changedFields,
      updatedAt: new Date(),
    } as T & { updatedAt: Date };
  }
}
