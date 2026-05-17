"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

export default function Homepage() {
  const [latestMessage, setLatestMessage] = useState("");
  const [status, setStatus] = useState<{ status: boolean | null; message: string | null }>({
    status: null,
    message: null,
  });

  const ref = useRef<WebSocket>(null);
  const target = useRef(() => `ws://${window.location.host}/api/ws`);
  const [, update] = useState(0);
  const socket = ref.current;

  const clearStatus = () => setStatus({ status: null, message: null });
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latestMessage);
      setStatus({ status: true, message: "Text copied successfully!" });
    } catch (err) {
      setStatus({ status: false, message: "Failed to copy text into clipboard!" });
      console.error(err);
    }
  };

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || socket.readyState !== socket.OPEN) return;
      socket.send(message);
      setLatestMessage(message);
      setStatus({ status: true, message: "Text sent to all clients successfully!" });
    },
    [socket]
  );

  useEffect(() => {
    if (ref.current) return;
    const socket = new WebSocket(target.current());
    Reflect.set(ref, "current", socket);
    update((p) => p + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener(
      "message",
      async (event) => {
        const payload = await event.data.text();
        setLatestMessage(payload);
        clearStatus();
      },
      controller
    );

    socket?.addEventListener("error", () => {
      setStatus({ status: false, message: "Some error occured!" });
    });

    socket?.addEventListener("close", () => {
      setStatus({ status: false, message: "Connection closed!" });
    });

    return () => controller.abort();
  }, [socket]);

  return (
    <div className="flex h-svh items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Secure Paste</CardTitle>
          <CardDescription>
            This tool lets you copy paste any text content within the same network — open the page on both devices and
            publish from one to another.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <InputGroup>
              <InputGroupTextarea
                placeholder="..."
                className="min-h-[220px] resize"
                value={latestMessage}
                onChange={(event) => setLatestMessage(event.currentTarget.value)}
              />
            </InputGroup>
            {status.message && (
              <Alert
                className={status.status === true ? "border-green-400 text-green-400" : "border-red-400 text-red-400"}
              >
                <AlertTitle>{status.message}</AlertTitle>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              if (latestMessage) sendMessage(latestMessage);
            }}
          >
            Publish New Text
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={copyToClipboard}>
            Copy Current Text
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
