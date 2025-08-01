class ServiceException(Exception):
    """Base exception for the service layer"""

    pass


class InvalidFileTypeException(ServiceException):
    pass


class ImageNotFoundException(ServiceException):
    pass


class ImageStorageException(ServiceException):
    """Raised when there is an error saving or deleting an image"""

    pass
