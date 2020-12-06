from fastapi import HTTPException
import aioboto3

from decimal import Decimal
import json

from util import config

# res = await aioboto3.resource('dynamodb').__aenter__() ?

dynamo_args = {
    'aws_access_key_id': config['aws_access_key_id'],
    'aws_secret_access_key': config['aws_secret_access_key'],
    'region_name': config['region_name']
}

dynamodb_global = None


async def get_dynamo_db():
    global dynamodb_global
    if dynamodb_global is None:
        dynamodb_global = await aioboto3.resource('dynamodb',
                                                  **dynamo_args).__aenter__()
    return dynamodb_global


async def set_item(id, **args):
    # async with aioboto3.resource('dynamodb', **dynamo_args) as dynamodb:
    dynamodb = await get_dynamo_db()
    table = await dynamodb.Table('ocs')
    data = {
        'id': id,
        **args,
    }
    data = json.loads(json.dumps(data), parse_float=Decimal)
    response = await table.put_item(Item=data)
    return response


async def get_item(id):
    # async with aioboto3.resource('dynamodb', **dynamo_args) as dynamodb:
    dynamodb = await get_dynamo_db()
    table = await dynamodb.Table('ocs')
    response = await table.get_item(Key={'id': id})
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="Not found")
    return response['Item']
