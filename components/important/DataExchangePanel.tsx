'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';

const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];

export function DataExchangePanel() {
  const [importStatus, setImportStatus] = useState<string>('No file selected');
  const [confirmExport, setConfirmExport] = useState(false);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportStatus('No file selected');
      return;
    }
    // Import validation enforces supported formats before upload processing.
    if (!allowedTypes.includes(file.type)) {
      setImportStatus('Validation failed: unsupported format (use CSV, Excel, or JSON).');
      return;
    }
    setImportStatus(`Validation passed: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ready for import.`);
  };

  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-4">
        <p className="text-lg font-medium text-white">Import & Export Console</p>
        <p className="mt-1 text-sm text-mist/65">Flexible data exchange with validation and export confirmation.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-ink/60 p-4">
          <p className="text-sm font-medium text-white">Import Data</p>
          <input
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            onChange={onFileChange}
            className="mt-3 block w-full text-sm text-mist/80 file:mr-3 file:rounded-lg file:border-0 file:bg-slate file:px-3 file:py-2 file:text-white"
          />
          <p className="mt-3 text-sm text-mist/75">{importStatus}</p>
          <Button className="mt-3">Run Import</Button>
        </article>

        <article className="rounded-2xl border border-white/10 bg-ink/60 p-4">
          <p className="text-sm font-medium text-white">Export Data</p>
          <p className="mt-3 text-sm text-mist/75">Choose export format and confirm before download.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setConfirmExport(true)}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => setConfirmExport(true)}>
              Export Excel
            </Button>
            <Button variant="secondary" onClick={() => setConfirmExport(true)}>
              Export JSON
            </Button>
          </div>
          {confirmExport ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-mist/80">
              Confirm export queued. Download package will include schema + data snapshot.
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
