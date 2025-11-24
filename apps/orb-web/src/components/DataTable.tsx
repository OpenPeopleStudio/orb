import { useState } from 'react';

import type { TableRecord, ColumnMetadata } from '../lib/supabase/types';

interface Props {
  data: TableRecord[];
  columns: ColumnMetadata[];
  loading?: boolean;
  color?: string;
}

export default function DataTable({ data, columns, loading, color = 'accent-orb' }: Props) {
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  const toggleCell = (cellKey: string) => {
    const newExpanded = new Set(expandedCells);
    if (newExpanded.has(cellKey)) {
      newExpanded.delete(cellKey);
    } else {
      newExpanded.add(cellKey);
    }
    setExpandedCells(newExpanded);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-bg-surface/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-medium text-text-muted"
                  style={{ width: col.width }}
                >
                  <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-white/10" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <p className="text-text-muted">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-bg-surface/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-sm font-medium text-text-muted"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-white/5 transition-colors hover:bg-white/5"
            >
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key];
                const cellKey = `${rowIndex}-${col.key}`;
                const isExpanded = expandedCells.has(cellKey);

                return (
                  <td key={col.key} className="px-4 py-3">
                    <CellContent
                      value={value}
                      type={col.type}
                      isExpanded={isExpanded}
                      onToggle={() => toggleCell(cellKey)}
                      color={color}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CellContentProps {
  value: unknown;
  type: ColumnMetadata['type'];
  isExpanded: boolean;
  onToggle: () => void;
  color: string;
}

function CellContent({ value, type, isExpanded, onToggle, color }: CellContentProps) {
  if (value === null || value === undefined) {
    return <span className="text-text-muted italic">null</span>;
  }

  // Handle different column types
  switch (type) {
    case 'id':
      return (
        <span className="font-mono text-xs text-text-muted">
          {String(value).slice(0, 8)}...
        </span>
      );

    case 'timestamp':
      return (
        <span className="text-sm text-text-muted" title={String(value)}>
          {formatTimestamp(String(value))}
        </span>
      );

    case 'json':
      return (
        <JsonCell
          value={value}
          isExpanded={isExpanded}
          onToggle={onToggle}
          color={color}
        />
      );

    case 'text':
    default: {
      const text = String(value);
      const isLong = text.length > 100;

      if (!isLong) {
        return <span className="text-sm text-text-primary">{text}</span>;
      }

      return (
        <div className="max-w-md">
          <p className={`text-sm text-text-primary ${isExpanded ? '' : 'line-clamp-2'}`}>
            {text}
          </p>
          {isLong && (
            <button
              onClick={onToggle}
              className={`mt-1 text-xs text-${color} hover:underline`}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      );
    }
  }
}

interface JsonCellProps {
  value: unknown;
  isExpanded: boolean;
  onToggle: () => void;
  color: string;
}

function JsonCell({ value, isExpanded, onToggle, color }: JsonCellProps) {
  const jsonString = JSON.stringify(value, null, 2);
  const isComplex = jsonString.length > 50;

  if (!isComplex) {
    return (
      <span className="font-mono text-xs text-text-muted">
        {JSON.stringify(value)}
      </span>
    );
  }

  return (
    <div>
      {isExpanded ? (
        <pre className="max-w-lg overflow-x-auto rounded bg-black/20 p-2 font-mono text-xs text-text-primary">
          {jsonString}
        </pre>
      ) : (
        <span className="font-mono text-xs text-text-muted">
          {Array.isArray(value) ? `[${value.length} items]` : '{...}'}
        </span>
      )}
      <button
        onClick={onToggle}
        className={`mt-1 text-xs text-${color} hover:underline`}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  } catch {
    return String(timestamp);
  }
}

