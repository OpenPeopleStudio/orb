import { useState, useEffect } from 'react';

import DataTable from '../../components/DataTable';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { fetchTableData, getAllTables, getTableMetadata } from '../../lib/supabase/database';
import type { TableName, TableRecord, QueryOptions } from '../../lib/supabase/types';

export default function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [data, setData] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const allTables = getAllTables();
  const tableMetadata = selectedTable ? getTableMetadata(selectedTable) : null;

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (allTables.length > 0 && !selectedTable) {
      setSelectedTable(allTables[0].name);
    }
  }, []);

  useEffect(() => {
    if (selectedTable && supabaseConfigured) {
      loadData();
    }
  }, [selectedTable, searchQuery, currentPage]);

  const loadData = async () => {
    if (!selectedTable) return;

    setLoading(true);
    setError(null);

    const options: QueryOptions = {
      limit: pageSize,
      offset: currentPage * pageSize,
      search: searchQuery || undefined,
    };

    const result = await fetchTableData(selectedTable, options);

    if (result.error) {
      setError(result.error);
      setData([]);
      setTotalCount(0);
    } else {
      setData(result.data);
      setTotalCount(result.count);
    }

    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleRefresh = () => {
    loadData();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!supabaseConfigured) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Database Viewer</h1>
          <p className="mt-2 text-text-muted">View and browse Orb database tables</p>
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6">
          <h2 className="text-lg font-semibold text-yellow-400">Supabase Not Configured</h2>
          <p className="mt-2 text-sm text-text-muted">
            Please configure your Supabase connection to use the database viewer.
          </p>
          <div className="mt-4 space-y-2 text-sm text-text-muted">
            <p>Add the following environment variables:</p>
            <pre className="mt-2 rounded bg-black/20 p-3 font-mono text-xs">
              VITE_SUPABASE_URL=your-project-url{'\n'}
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Database Viewer</h1>
        <p className="mt-2 text-text-muted">View and browse Orb database tables</p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Table Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTable || ''}
            onChange={(e) => {
              setSelectedTable(e.target.value as TableName);
              setCurrentPage(0);
              setSearchQuery('');
            }}
            className="rounded-lg border border-white/10 bg-bg-root px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
          >
            {allTables.map((table) => (
              <option key={table.name} value={table.name}>
                {table.icon} {table.displayName}
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/5 disabled:opacity-50"
          >
            🔄 Refresh
          </button>

          {tableMetadata && (
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm font-medium text-${tableMetadata.color}`}>
                {tableMetadata.displayName}
              </span>
              <span className="text-sm text-text-muted">
                {totalCount !== null ? `${totalCount} records` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-white/10 bg-bg-root px-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-orb"
          />
        </div>

        {/* Table Description */}
        {tableMetadata && (
          <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <p className="text-sm text-text-muted">{tableMetadata.description}</p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Data Table */}
      {tableMetadata && (
        <DataTable
          data={data}
          columns={tableMetadata.columns}
          loading={loading}
          color={tableMetadata.color}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-text-muted">
            Page {currentPage + 1} of {totalPages} ({totalCount} total records)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/5 disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/5 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

