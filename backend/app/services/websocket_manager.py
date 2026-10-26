import json
from typing import Dict, List, Any
from fastapi import WebSocket
from app.utils.logger import logger


class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSockets (allows multiple tabs/devices)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user_id={user_id}. Active sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user_id={user_id}")

    async def send_personal_message(self, message: Dict[str, Any], user_id: int):
        """Sends a JSON message to all active connections of a specific user."""
        if user_id in self.active_connections:
            dead_sockets = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Failed to send to websocket for user {user_id}: {e}")
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect(dead, user_id)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts a JSON message to every connected client."""
        for user_id, sockets in list(self.active_connections.items()):
            for socket in sockets:
                try:
                    await socket.send_json(message)
                except Exception as e:
                    logger.warning(f"Broadcast failed for socket: {e}")


ws_manager = ConnectionManager()
