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
}


def new_id(size=20):
    return ''.join(random.choices(chars, k=size))


def is_int(val):
    try:
        val = int(val)
        return True
    except:
        return False
