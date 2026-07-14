import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import PyodideWorker from '../worker/pyodide.worker?worker';

export interface RunResult {
  stdout: string;
  stderr: string;
  error?: string;
  isTimeout?: boolean;
  trace?: any[];
  events?: any[];
}

// Module-level worker instance to persist across component mounts
let sharedWorker: Worker | null = null;
let isSharedWorkerReady = false;
let isSharedWorkerInitializing = false;
const readyListeners = new Set<(ready: boolean) => void>();
const messageListeners = new Set<(event: MessageEvent) => void>();

function initSharedWorker() {
  if (sharedWorker || isSharedWorkerInitializing) return;
  isSharedWorkerInitializing = true;
  
  try {
    sharedWorker = new PyodideWorker();
    sharedWorker.onmessage = (event: MessageEvent) => {
      const { type } = event.data;
      if (type === 'ready') {
        isSharedWorkerReady = true;
        isSharedWorkerInitializing = false;
        readyListeners.forEach(listener => listener(true));
      }
      messageListeners.forEach(listener => listener(event));
    };
    
    sharedWorker.onerror = (err) => {
      console.error("Worker core error:", err);
      isSharedWorkerInitializing = false;
    };
  } catch (err) {
    console.error("Failed to initialize worker:", err);
    isSharedWorkerInitializing = false;
  }
}

function terminateSharedWorker() {
  if (sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
    isSharedWorkerReady = false;
    isSharedWorkerInitializing = false;
    readyListeners.forEach(listener => listener(false));
  }
}

export const usePyodide = () => {
  const [isReady, setIsReady] = useState(isSharedWorkerReady);
  const [isRunning, setIsRunning] = useState(false);
  const currentResolveRef = useRef<((res: RunResult) => void) | null>(null);
  const timeoutIdRef = useRef<any>(null);
  
  // Real-time output streaming buffers
  const [streamStdout, setStreamStdout] = useState('');
  const [streamStderr, setStreamStderr] = useState('');

  useEffect(() => {
    // Start worker if not loaded yet
    initSharedWorker();
    
    // Register hook-specific listeners
    const handleReadyChange = (ready: boolean) => {
      setIsReady(ready);
    };
    readyListeners.add(handleReadyChange);
    setIsReady(isSharedWorkerReady);

    return () => {
      readyListeners.delete(handleReadyChange);
    };
  }, []);

  const runCode = (
    code: string,
    visualizerId?: string,
    onChunk?: (type: 'stdout' | 'stderr', text: string) => void
  ): Promise<RunResult> => {
    return new Promise((resolve) => {
      if (!isSharedWorkerReady) {
        resolve({
          stdout: '',
          stderr: '',
          error: 'Runtime is not ready yet. Please wait for initialization.',
        });
        return;
      }

      setIsRunning(true);
      setStreamStdout('');
      setStreamStderr('');
      currentResolveRef.current = resolve;

      let accumulatedStdout = '';
      let accumulatedStderr = '';

      // Force-terminate infinite loops at 5 seconds
      const timeoutId = setTimeout(() => {
        terminateSharedWorker();
        // Respawn the worker in the background for future runs
        initSharedWorker();
        
        setIsRunning(false);
        if (currentResolveRef.current === resolve) {
          resolve({
            stdout: accumulatedStdout,
            stderr: accumulatedStderr,
            error: 'TimeoutError: Execution exceeded 5 seconds. (Potential infinite loop detected)',
            isTimeout: true,
          });
          currentResolveRef.current = null;
        }
      }, 5000);
      timeoutIdRef.current = timeoutId;

      const handleWorkerMessage = (event: MessageEvent) => {
        const { type, content, stdout, stderr, error, trace, events } = event.data;

        if (type === 'stdout') {
          accumulatedStdout += content;
          setStreamStdout(accumulatedStdout);
          if (onChunk) onChunk('stdout', content);
        } else if (type === 'stderr') {
          accumulatedStderr += content;
          setStreamStderr(accumulatedStderr);
          if (onChunk) onChunk('stderr', content);
        } else if (type === 'result') {
          // Clear timeout and remove listeners
          clearTimeout(timeoutId);
          messageListeners.delete(handleWorkerMessage);
          setIsRunning(false);

          if (currentResolveRef.current === resolve) {
            resolve({
              stdout: stdout !== undefined ? stdout : accumulatedStdout,
              stderr: stderr !== undefined ? stderr : accumulatedStderr,
              error: error || undefined,
              trace: trace || undefined,
              events: events || undefined,
            });
            currentResolveRef.current = null;
          }
        }
      };

      messageListeners.add(handleWorkerMessage);
      
      // Send execution request to worker
      initSharedWorker();
      const worker = sharedWorker!;
      worker.postMessage({ action: 'run', code, visualizerId });
    });
  };

  const cancelExecution = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    terminateSharedWorker();
    initSharedWorker();
    setIsRunning(false);
    
    if (currentResolveRef.current) {
      currentResolveRef.current({
        stdout: '',
        stderr: '',
        error: 'Execution cancelled by user.',
      });
      currentResolveRef.current = null;
    }
  };

  return {
    runCode,
    isRunning,
    isReady,
    streamStdout,
    streamStderr,
    cancelExecution,
  };
};
