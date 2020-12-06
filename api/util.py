import json
import random

chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

with open('../.config.json') as f:
    config = json.load(f)


def new_id(size=20):
    return ''.join(random.choices(chars, k=size))


def is_int(val):
    try:
        val = int(val)
        return True
    except:
        return False
