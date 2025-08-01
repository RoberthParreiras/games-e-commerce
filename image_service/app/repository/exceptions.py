class RepositoryException(Exception):
    """Base exception for the repository layer"""

    pass


class StorageOperationError(RepositoryException):
    pass


class DatabaseOperationError(RepositoryException):
    pass
