import { headers } from "next/headers";

export function GET() {
  const headers = new Headers();
  headers.set("Connection", "Upgrade");
  headers.set("Upgrade", "websocket");
  return new Response("Upgrade Required", { status: 426, headers });
}

export async function UPGRADE(client: import("ws").WebSocket, server: import("ws").WebSocketServer) {
  await headers();

  client.on("message", (message) => {
    for (const other of server.clients) if (client !== other && other.readyState === other.OPEN) other.send(message);
  });

  client.once("close", () => {
    console.info("[Server] a client disconnected!");
  });
}
