import logging
import os
from enum import StrEnum

LOG_FORMAT_DEBUG = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

class LogLevels(StrEnum):
    info = "INFO"
    warning = "WARNING"
    error = "ERROR"
    debug = "DEBUG"

def setup_logging():
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    log_levels = list(LogLevels)

    if log_level not in log_levels:
        logging.basicConfig(level=LogLevels.error)
        return

    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT_DEBUG,
        handlers=[logging.StreamHandler()]
    )

    