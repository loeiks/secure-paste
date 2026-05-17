"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
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
    <div className="flex h-[100vh] items-center justify-center p-8">
      <Card className="w-[60%] p-6">
        <CardHeader className="p-0">
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Secure Paste</h1>
        </CardHeader>
        <CardDescription>
          <p className="text-muted-foreground text-sm">
            This tool let you copy paste any text content within same network, just open up the page on both devices and
            publish one from another.
          </p>
        </CardDescription>
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-0">
          <InputGroup>
            <InputGroupTextarea
              placeholder="..."
              className="min-h-[220px] resize"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.currentTarget.value);
              }}
            ></InputGroupTextarea>
          </InputGroup>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              if (inputValue) sendMessage(inputValue);
            }}
          >
            Publish New Text
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
