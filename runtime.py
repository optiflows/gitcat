import sys


class RuntimeContext(object):
    """
    Handle runtime context as a singleton.
    """

    _instance = None

    @classmethod
    def instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

sys.modules[__name__] = RuntimeContext.instance()