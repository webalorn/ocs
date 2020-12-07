from typing import Optional, List

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

from api.db import get_item, set_item
from api.chat import *
from api.util import new_id

app = FastAPI()
app.mount("/web", StaticFiles(directory="static"), name="static")


class Sheet(BaseModel):
    id: str
    content: dict


class Table(BaseModel):
    id: str
    characters: List[str]


@app.get("/")
async def read_root():
    return "You may be lost..."


@app.get("/api/sheet/{sheet_id}", response_model=Sheet)
async def get_sheet(sheet_id: str):
    return await get_item(sheet_id)


@app.put("/api/sheet/{sheet_id}")
async def put_sheet(sheet: Sheet, sheet_id: str):
    sheet.id = sheet_id
    await set_item(**sheet.dict())
    return 'OK'


@app.post("/api/sheet", response_model=Sheet)
async def create_sheet():
    sheet = Sheet(id=new_id(), content={})
    await set_item(**sheet.dict())
    return sheet


@app.get("/api/table/{table_id}", response_model=Table)
async def get_table(table_id: str):
    return await get_item(table_id)


@app.put("/api/table/{table_id}")
async def put_table(table: Table, table_id: str):
    table.id = table_id
    await set_item(**table.dict())
    return 'OK'


@app.post("/api/table", response_model=Table)
async def create_table():
    table = Table(id=new_id(), characters=[])
    await set_item(**table.dict())
    return table


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


table_groups = {}


@app.websocket("/ws/table/{table_id}")  # Chat
async def websocket_endpoint(websocket: WebSocket, table_id: str):
    table = await get_item(table_id)
    if table_id not in table_groups:
        table_groups[table_id] = WebsocketGroup()
    group = table_groups[table_id]

    await websocket.accept()
    await group.connect(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            try:
                send_message = process_message(message)
                send_message['from'] = message['from']
                send_message['from_name'] = message['from_name']
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
        group.disconnect(websocket)
