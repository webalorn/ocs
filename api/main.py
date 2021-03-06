from typing import Optional, List
from collections import defaultdict

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse

from api.db import get_item, set_item
from api.chat import *
from api.util import new_id, config
from api.sheet import load_optolith_data, convert_from_optolith, OptolithConversionError

from pathlib import Path
import shutil
import time

Path("upload").mkdir(parents=True, exist_ok=True)
load_optolith_data()

app = FastAPI()
app.mount("/web", StaticFiles(directory="static"), name="static")
app.mount("/upload", StaticFiles(directory="upload"), name="static")

# Models


class Sheet(BaseModel):
    id: str
    content: dict


class JsonData(BaseModel):
    data: dict


class Table(BaseModel):
    id: str
    characters: List[str]
    name: str = "Unnamed"
    sheet_view: str = "default"
    choose_roll_target: bool = True
    simple_rules: bool = False


class NewTable(BaseModel):
    name: str = "Unnamed"


class TableUpdateData(BaseModel):
    name: str
    sheet_view: str
    choose_roll_target: bool
    simple_rules: bool


# @app.get("/")
# async def read_root():
#     return "You may be lost..."


@app.get("/")
async def redirect_root():
    return RedirectResponse(url='/web/index.html')


@app.get("/keepalive")
async def keepalive():
    return f'OK - {int(time.time())}'


@app.get("/web")
async def redirect_web():
    return RedirectResponse(url='/web/index.html')


@app.get("/api/sheet/{sheet_id}", response_model=Sheet)
async def get_sheet(sheet_id: str):
    return await get_item(sheet_id)


@app.put("/api/sheet/{sheet_id}")
async def put_sheet(sheet: Sheet, sheet_id: str):
    sheet.id = sheet_id
    await set_item(**sheet.dict())
    await sheet_groups[sheet_id].broadcast({
        'type': 'notification',
        'on': 'sheet',
        'sheet_id': sheet_id,
        'new_data': sheet.dict(),
    })
    return 'OK'


@app.post("/api/sheet", response_model=Sheet)
async def create_sheet():
    sheet = Sheet(id=new_id(), content={})
    await set_item(**sheet.dict())
    return sheet


@app.post("/api/sheet/optolith")
async def load_from_optolith(import_data: JsonData):
    # if not OPTO_AVAILABLE:
    #     raise HTTPException(status_code=501,
    #                         detail=f"Missing optolith ressources")
    try:
        return await convert_from_optolith(import_data.data)
    except OptolithConversionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/table/{table_id}/update")
async def put_table(table_update: TableUpdateData, table_id: str):
    table = await get_item(table_id)

    for key, val in table_update.dict().items():
        table[key] = val

    await set_item(**table)
    return 'OK'


@app.post("/api/table/{table_id}/player/{player_id}")
async def post_table(table_id: str, player_id: str):
    table = await get_item(table_id)
    if player_id in table['characters']:
        raise HTTPException(status_code=400,
                            detail=f"Player {player_id} already in this table")
    else:
        table['characters'].append(player_id)
        await set_item(**table)
        return 'OK'


@app.delete("/api/table/{table_id}/player/{player_id}")
async def delete_table(table_id: str, player_id: str):
    table = await get_item(table_id)
    if player_id in table['characters']:
        table['characters'].remove(player_id)
        await set_item(**table)
        return 'OK'
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Player {player_id} doesn't belong to this table")


@app.get("/api/table/{table_id}", response_model=Table)
async def get_table(table_id: str):
    return await get_item(table_id)


@app.put("/api/table/{table_id}")
async def put_table(table: Table, table_id: str):
    table.id = table_id
    await set_item(**table.dict())
    return 'OK'


@app.post("/api/table", response_model=Table)
async def create_table(new_table: NewTable):
    table = Table(id=new_id(), characters=[], name=new_table.name)
    await set_item(**table.dict())
    return table


# ========== Uploads and files ==========


@app.post("/api/upload")
async def create_upload_file(file: UploadFile = File(...)):
    path = "upload/" + new_id() + '.' + file.filename.split('.')[-1]
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": '/' + path}


# @app.get("/api/upload/{image_name}")
# async def get_upload_file(image_name: str):
#     path = "upload/" + image_name
#     if '/' in image_name or not os.path.isfile(path):
#         raise HTTPException(status_code=404,
#                             detail=f"Image {image_name} doesn't exists")
#     return FileResponse(path)

# ========== Sockets ==========


class WebsocketGroup:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: str):
        for connection in self.active_connections:
            await connection.send_json(data)

    async def broadcast_other(self, websocket, data: str):
        for connection in self.active_connections:
            if connection is not websocket:
                await connection.send_json(data)


table_groups = defaultdict(lambda: WebsocketGroup())
sheet_groups = defaultdict(lambda: WebsocketGroup())

KEEP_MSG_ARGS = ['from', 'from_name', 'using']


@app.websocket("/ws/table/{table_id}")  # Chat
async def websocket_endpoint_table(websocket: WebSocket, table_id: str):
    table = await get_item(table_id)
    group = table_groups[table_id]

    await websocket.accept()
    await group.connect(websocket)
    for user_id in table['characters']:
        await sheet_groups[user_id].connect(websocket)
    from_name = None
    try:
        while True:
            message = await websocket.receive_json()
            try:
                send_message = process_message(message)
                for key in KEEP_MSG_ARGS:
                    if key in message:
                        send_message[key] = message[key]
                from_name = message['from_name']
                if 'target' not in send_message:
                    if 'target' in message:
                        send_message['target'] = message['target']
                    else:
                        send_message['target'] = 'all'
                send_message['roll_name'] = message.get('roll_name', '')

                # if send_message.get('target', None) == 'self':
                #     await websocket.send_json(send_message)
                # else:
                await group.broadcast(send_message)
            except MessageError as e:
                await websocket.send_json({
                    'type': 'error',
                    'message': e.text,
                })
            except Exception as e:
                await websocket.send_json({
                    'type': 'error',
                    'message': str(e),
                })
    except WebSocketDisconnect:
        pass
    finally:
        group.disconnect(websocket)
        for user_id in table['characters']:
            sheet_groups[user_id].disconnect(websocket)
    if from_name is not None:
        await group.broadcast({
            'from': None,
            'from_name': from_name,
            'target': 'all',
            'type': 'quit',
        })


@app.websocket("/ws/sheet/{sheet_id}")  # Sheet
async def websocket_endpoint_sheet(websocket: WebSocket, sheet_id: str):
    group = sheet_groups[sheet_id]

    await websocket.accept()
    await group.connect(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            await websocket.send_json({
                'type': 'error',
                'message': 'Sender only',
            })
    except WebSocketDisconnect:
        pass
    finally:
        group.disconnect(websocket)
