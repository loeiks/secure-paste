"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

export default function Homepage() {
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
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener(
      "message",
      async (event) => {
        const payload = await event.data.text();
        console.log("Incoming message:", payload);
        setInputValue(payload);
      },
      controller
    );

    return () => controller.abort();
  }, [socket]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || socket.readyState !== socket.OPEN) return;
      socket.send(message);
      setInputValue(message);
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
          <InputGroup>
            <InputGroupTextarea
              placeholder="..."
              className="min-h-[220px] resize"
              value={inputValue}
              onChange={(event) => setInputValue(event.currentTarget.value)}
            />
          </InputGroup>
        </CardContent>
        <CardFooter className="gap-4">
          <Button size="lg" className="flex-1" onClick={() => inputValue && sendMessage(inputValue)}>
            Publish New Text
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={() => inputValue && sendMessage(inputValue)}>
            Copy Current Text
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
