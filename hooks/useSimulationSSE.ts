'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SSEEvent, SessionStatus } from '@/types/api';

export interface SimState {
  sessions: Record<string, SessionStatus>;
  feedLog: FeedEntry[];
  conversations: number;
  issueCount: number;
  isComplete: boolean;
  isEvaluating: boolean;
}

export interface FeedEntry {
  id: number;
  timestamp: string;
  event: string;
  personaId?: string;
  personaType?: string;
  turnIndex?: number;
  label: string;
  color: 'green' | 'red' | 'blue' | 'amber' | 'default';
}

const MAX_FEED = 200;
let feedCounter = 0;

const PERSONA_DISPLAY: Record<string, string> = {
  low_literacy: 'Low Literacy',
  non_native: 'Non-Native Speaker',
  adversarial: 'Adversarial User',
  distressed: 'Distressed User',
  domain_expert: 'Domain Expert',
  ambiguous: 'Ambiguous User',
  multi_turn_drift: 'Multi-turn Drift',
};

function displayName(type?: string | null): string {
  return type ? (PERSONA_DISPLAY[type] ?? type) : 'Unknown';
}

function makeEntry(event: SSEEvent): FeedEntry {
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const name = displayName(event.persona_type);
  feedCounter++;

  switch (event.event) {
    case 'session_started':
      return { id: feedCounter, timestamp: ts, event: 'session_started', personaId: event.persona_id, personaType: event.persona_type, label: `session_started    ${name} (${event.persona_id})`, color: 'blue' };
    case 'turn_completed':
      return { id: feedCounter, timestamp: ts, event: 'turn_completed', personaId: event.persona_id, turnIndex: event.turn_index, label: `turn_completed     ${event.persona_id} → turn ${(event.turn_index ?? 0) + 1}/8`, color: 'default' };
    case 'session_completed':
      return { id: feedCounter, timestamp: ts, event: 'session_completed', personaId: event.persona_id, personaType: event.persona_type, label: `session_completed  ${name} (${event.persona_id}) ✓`, color: 'green' };
    case 'session_failed':
      return { id: feedCounter, timestamp: ts, event: 'session_failed', personaId: event.persona_id, personaType: event.persona_type, label: `session_failed     ${name} (${event.persona_id}) ✗`, color: 'red' };
    case 'evaluation_started':
      return { id: feedCounter, timestamp: ts, event: 'evaluation_started', label: 'evaluation_started Analyzing results…', color: 'amber' };
    case 'run_complete':
      return { id: feedCounter, timestamp: ts, event: 'run_complete', label: 'run_complete       Evaluation finished', color: 'green' };
    default:
      return { id: feedCounter, timestamp: ts, event: event.event, label: event.event, color: 'default' };
  }
}

const INITIAL_STATE: SimState = {
  sessions: {},
  feedLog: [],
  conversations: 0,
  issueCount: 0,
  isComplete: false,
  isEvaluating: false,
};

export function useSimulationSSE(runId: string) {
  const [state, setState] = useState<SimState>(INITIAL_STATE);
  const [sseConnected, setSseConnected] = useState(false);
  const [sseFailed, setSseFailed] = useState(false);
  const retryCount = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  const dispatch = useCallback((event: SSEEvent) => {
    setState((prev) => {
      const entry = makeEntry(event);
      const sessions = { ...prev.sessions };

      switch (event.event) {
        case 'session_started':
          if (event.persona_id) {
            sessions[event.persona_id] = {
              persona_id: event.persona_id,
              persona_type: event.persona_type,
              persona_name: displayName(event.persona_type),
              status: 'in_progress',
              turns_completed: 0,
            };
          }
          break;
        case 'turn_completed':
          if (event.persona_id && sessions[event.persona_id]) {
            sessions[event.persona_id] = {
              ...sessions[event.persona_id],
              turns_completed: (event.turn_index ?? 0) + 1,
            };
          }
          break;
        case 'session_completed':
          if (event.persona_id && sessions[event.persona_id]) {
            sessions[event.persona_id] = {
              ...sessions[event.persona_id],
              status: 'completed',
            };
          }
          break;
        case 'session_failed':
          if (event.persona_id && sessions[event.persona_id]) {
            sessions[event.persona_id] = {
              ...sessions[event.persona_id],
              status: 'failed',
            };
          }
          break;
      }

      const feedLog = [...prev.feedLog, entry].slice(-MAX_FEED);
      const conversations =
        event.event === 'turn_completed' ? prev.conversations + 1 : prev.conversations;
      const isEvaluating =
        event.event === 'evaluation_started' ? true : prev.isEvaluating;
      const isComplete = event.event === 'run_complete';

      return { sessions, feedLog, conversations, issueCount: prev.issueCount, isEvaluating, isComplete };
    });
  }, []);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(`/api/v1/runs/${runId}/stream`);
    esRef.current = es;

    es.onopen = () => {
      setSseConnected(true);
      retryCount.current = 0;
    };

    es.onmessage = (e) => {
      try {
        const data: SSEEvent = JSON.parse(e.data);
        dispatch(data);
        if (data.event === 'run_complete') {
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      setSseConnected(false);
      if (retryCount.current < 3) {
        retryCount.current++;
        const backoff = Math.pow(2, retryCount.current) * 1000;
        setTimeout(connect, backoff);
      } else {
        setSseFailed(true);
      }
    };
  }, [runId, dispatch]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  return { state, sseConnected, sseFailed };
}
