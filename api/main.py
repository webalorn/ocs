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
from api.sheet import is_optolith_available, load_optolith_data, convert_from_optolith, OptolithConversionError

from pathlib import Path
import shutil, os

app = FastAPI()
app.mount("/web", StaticFiles(directory="static"), name="static")
Path("upload").mkdir(parents=True, exist_ok=True)

if not Path("optolith-data").is_dir():
    Path("optolith-data").mkdir(parents=True, exist_ok=True)
    if config['github_token'] is not None:
        os.system(
            f"git clone https://{config['github_token']}@github.com/elyukai/optolith-data"
        )
    else:
        print("[WARNING] No github token, Optolith import is unavailable")

OPTO_AVAILABLE = is_optolith_available()
if OPTO_AVAILABLE:
    load_optolith_data()

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


class NewTable(BaseModel):
    name: str = "Unnamed"


# @app.get("/")
# async def read_root():
#     return "You may be lost..."


@app.get("/")
async def redirect():
    return RedirectResponse(url='/web/index.html')


@app.get("/web")
async def redirect():
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
async def create_sheet(import_data: JsonData):
    if not OPTO_AVAILABLE:
        raise HTTPException(status_code=501,
                            detail=f"Missing optolith ressources")
    try:
        return await convert_from_optolith(import_data.data)
    except OptolithConversionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/table/{table_id}/update")
async def get_table(table_update: NewTable, table_id: str):
    table = await get_item(table_id)
    table['name'] = table_update.name
    await set_item(**table)
    return 'OK'


@app.post("/api/table/{table_id}/player/{player_id}")
async def get_table(table_id: str, player_id: str):
    table = await get_item(table_id)
    if player_id in table['characters']:
        raise HTTPException(status_code=400,
                            detail=f"Player {player_id} already in this table")
    else:
        table['characters'].append(player_id)
        await set_item(**table)
        return 'OK'


@app.delete("/api/table/{table_id}/player/{player_id}")
async def get_table(table_id: str, player_id: str):
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
    return {"url": '/api/' + path}


@app.get("/api/upload/{image_name}")
async def create_upload_file(image_name: str):
    path = "upload/" + image_name
    if '/' in image_name or not os.path.isfile(path):
        raise HTTPException(status_code=404,
                            detail=f"Image {image_name} doesn't exists")
    return FileResponse(path)


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


@app.websocket("/ws/table/{table_id}")  # Chat
async def websocket_endpoint(websocket: WebSocket, table_id: str):
    table = await get_item(table_id)
    group = table_groups[table_id]

    await websocket.accept()
    await group.connect(websocket)
    for user_id in table['characters']:
        await sheet_groups[user_id].connect(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            try:
                send_message = process_message(message)
                send_message['from'] = message['from']
                send_message['from_name'] = message['from_name']
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


@app.websocket("/ws/sheet/{sheet_id}")  # Sheet
async def websocket_endpoint(websocket: WebSocket, sheet_id: str):
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
