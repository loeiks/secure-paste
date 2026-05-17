"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

export default function Homepage() {
  const [success, setSuccess] = useState<{ status: boolean; message: string | null }>({ status: false, message: null });

  const ref = useRef<WebSocket>(null);
  const target = useRef(() => `ws://${window.location.host}/api/ws`);
  const [, update] = useState(0);

  useEffect(() => {
    if (ref.current) return;
    const socket = new WebSocket(target.current());
    Reflect.set(ref, "current", socket);
    update((p) => p + 1);
  }, []);

  const socket = ref.current;
  const [latestMessage, setLatestMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener(
      "message",
      async (event) => {
        const payload = await event.data.text();
        setLatestMessage(payload);
        setSuccess({ status: false, message: null });
      },
      controller
    );

    return () => controller.abort();
  }, [socket]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || socket.readyState !== socket.OPEN) return;
      socket.send(message);
      setLatestMessage(message);
      setSuccess({ status: true, message: "Text sent to all clients successfully!" });
    },
    [socket]
  );

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
            {success.status && (
              <Alert className="transiti border-green-400 text-green-400">
                <AlertTitle>{success.message}</AlertTitle>
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
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (latestMessage) {
                navigator.clipboard.writeText(latestMessage);
                setSuccess({ status: true, message: "Text copied successfully!" });
              }
            }}
          >
            Copy Current Text
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
