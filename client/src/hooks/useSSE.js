import { useState, useEffect, useRef, useCallback } from 'react';

export default function useSSE(url, options = {}) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | complete | error
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus('connecting');
    setEvents([]);
    setError(null);

    // Use fetch for POST-based SSE (since EventSource only supports GET)
    const abortController = new AbortController();

    fetch(url, {
      method: options.method || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: abortController.signal
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus('connected');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = null;

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              const event = { type: currentEvent || 'message', data, timestamp: Date.now() };

              setEvents(prev => [...prev, event]);

              if (options.onEvent) options.onEvent(event);
              if (currentEvent === 'complete') setStatus('complete');
              if (currentEvent === 'error') {
                setStatus('error');
                setError(data.message);
              }
            } catch {
              // non-JSON data
            }
            currentEvent = null;
          }
        }
      }

      if (status !== 'error') setStatus('complete');
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        setStatus('error');
        setError(err.message);
      }
    });

    eventSourceRef.current = { close: () => abortController.abort() };
  }, [url, options.method]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { events, status, error, connect, disconnect };
}
