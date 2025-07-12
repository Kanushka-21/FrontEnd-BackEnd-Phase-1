import React, { useState } from 'react';
import { Bug, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface APIDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface APILog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  requestData: any;
  responseData: any;
  status: 'success' | 'error' | 'pending';
  error?: any;
}

const APIDebugger: React.FC<APIDebuggerProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<APILog[]>([]);

  const addLog = (log: Omit<APILog, 'id' | 'timestamp'>) => {
    const newLog: APILog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success('Logs cleared');
  };

  const exportLogs = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported!');
  };

  // Hook into console.log to capture API logs
  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('response:') || args[0].includes('API')) {
          // Capture API logs
          addLog({
            method: 'UNKNOWN',
            url: 'console.log',
            requestData: args,
            responseData: null,
            status: 'success',
          });
        }
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('Error') || args[0].includes('API')) {
          // Capture API errors
          addLog({
            method: 'UNKNOWN',
            url: 'console.error',
            requestData: args,
            responseData: null,
            status: 'error',
            error: args[0],
          });
        }
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="Open API Debugger"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Bug size={16} className="mr-2" />
          API Debugger
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Clear logs"
          >
            Clear
          </button>
          <button
            onClick={exportLogs}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Export logs"
          >
            Export
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
            title="Close debugger"
          >
            ×
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-80 p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No API logs yet. Perform some actions to see logs here.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded text-xs border ${
                log.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : log.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {log.status === 'success' && <CheckCircle size={12} className="text-green-600" />}
                  {log.status === 'error' && <XCircle size={12} className="text-red-600" />}
                  {log.status === 'pending' && <AlertCircle size={12} className="text-yellow-600" />}
                  <span className="font-medium">{log.method}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy log"
                >
                  <Copy size={10} />
                </button>
              </div>
              
              <div className="text-gray-600 mb-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>

              <div className="text-gray-800 font-mono break-all">
                {log.url}
              </div>

              {log.requestData && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-gray-600">Request Data</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                    {JSON.stringify(log.requestData, null, 2)}
                  </pre>
                </details>
              )}

              {log.responseData && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-gray-600">Response Data</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                    {JSON.stringify(log.responseData, null, 2)}
                  </pre>
                </details>
              )}

              {log.error && (
                <div className="mt-1 text-red-600">
                  <strong>Error:</strong> {log.error.toString()}
                </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default APIDebugger;