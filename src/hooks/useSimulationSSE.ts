import { useEffect, useRef, useState } from "react";
import { sseUrl } from "../lib/api/client";
import type { SSEEvent } from "../types/api";

const RETRY_DELAYS = [1000, 2000, 4000];

export function useSimulationSSE(
  runId: string,
  token: string,
  onEvent: (evt: SSEEvent) => void,
  enabled = true
) {
  const [connected, setConnected] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const retryRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !runId || !token) return;

    function connect() {
      const url = sseUrl(`/v1/runs/${runId}/stream`, token);
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };

      es.onmessage = (e) => {
        try {
          const payload: SSEEvent = JSON.parse(e.data);
          onEvent(payload);
          if (payload.event === "run_complete") {
            es.close();
            setConnected(false);
          }
        } catch {
          // ignore malformed frames
        }
      };

      es.onerror = () => {
        es.close();
        setConnected(false);
        if (retryRef.current < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[retryRef.current++];
          setTimeout(connect, delay);
        } else {
          setExhausted(true);
        }
      };
    }

    connect();
    return () => {
      esRef.current?.close();
      setConnected(false);
    };
  }, [runId, token, enabled]);

  return { connected, exhausted };
}
