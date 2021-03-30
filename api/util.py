import json
import random
from decouple import config as env_config


class Nothing:
    pass


chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

config = {
    'aws_access_key_id': env_config('AWS_ACCESS_KEY_ID'),
    'aws_secret_access_key': env_config('AWS_SECRET_ACCESS_KEY'),
    'region_name': env_config('AWS_REGION_NAME'),
    'github_token': env_config('GIHUB_TOKEN', None),
    'imgbb_token': env_config('IMGBB_KEY', None),
}


def new_id(size=20):
    return ''.join(random.choices(chars, k=size))


def is_int(val):
    try:
        val = int(val)
        return True
    except:
        return False


class MagicDict:
    def __init__(self, data):
        self._data = data
        if isinstance(self._data, MagicDict):
            self._data = self._data._data
        elif isinstance(self._data, list):
            for i in range(len(self._data)):
                self._data[i] = MagicDict(self._data[i])
        elif isinstance(self._data, dict):
            for key, val in self._data.items():
                self._data[key] = MagicDict(val)
        else:
            self._data = data

    def no_magic(self, none_to=None):
        if isinstance(self._data, list):
            return [v.no_magic() for v in self._data]
        elif isinstance(self._data, dict):
            return {key: v.no_magic() for key, v in self._data.items()}
        elif self._data is None:
            return none_to
        else:
            return self._data

    def try_cast(self, to_type):
        if self._data is None:
            return to_type()
        try:
            return to_type(self._data)
        except ValueError:
            return to_type()

    def int(self):
        return self.try_cast(int)

    def float(self):
        return self.try_cast(float)

    def str(self):
        return self.try_cast(str)

    def get(self, val, default=None):
        if isinstance(self._data, list):
            if isinstance(val,
                          int) and -len(self._data) <= val < len(self._data):
                return self._data[val]
        elif isinstance(self._data, dict):
            if val in self._data:
                return self._data[val]
        return MagicDict(default)

    def as_value(self):
        if isinstance(self._data, list) or isinstance(self._data, dict):
            return self
        return self.no_magic(none_to='')

    def get_as_value(self, key, default=None):
        return self.get(key, default).as_value()

    def items(self):
        if isinstance(self._data, list):
            return [(i, self._data[i].as_value())
                    for i in range(len(self._data))]
        elif isinstance(self._data, dict):
            return {(key, val.as_value()) for key, val in self._data.items()}
        return [(None, self._data)]

    def __str__(self):
        return self.str()

    def __len__(self):
        try:
            return self._data.__len__()
        except AttributeError:
            return 0

    def __getitem__(self, key):
        if isinstance(key, slice):
            raise Exception("Not implemented")
        else:
            return self.get_as_value(key)

    def __getattr__(self, name):
        return self.get(name)

    def __iter__(self):
        if isinstance(self._data, list):
            return [v.as_value() for v in self._data].__iter__()
        elif isinstance(self._data, dict):
            return self._data.__iter__()
        return [self].__iter__()

    def __contains__(self, name):
        if isinstance(self._data, list):
            return isinstance(
                name, int) and -len(self._data) <= name < len(self._data)
        elif isinstance(self._data, dict):
            return name in self._data
        return False
