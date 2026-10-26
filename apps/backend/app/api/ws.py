from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager
from app.utils.logger import logger

router = APIRouter(tags=["Real-time WebSockets"])


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    Real-time bidirectional WebSocket connection for live emergency notifications,
    task checkoffs, and status changes.
    """
    await ws_manager.connect(websocket, user_id)
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "CareNest realtime connection active."
        })
        
        while True:
            # Keep-alive receive loop
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.warning(f"WebSocket error for user {user_id}: {e}")
        ws_manager.disconnect(websocket, user_id)
