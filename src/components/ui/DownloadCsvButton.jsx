import React from 'react';
import { Download } from 'lucide-react';
import Button from './Button';

// Generic "download whatever list is currently on screen" button — `onDownload` does the actual
// file-building (see src/utils/exportUtils.js), this just standardizes the button itself so every
// list page's download control looks and behaves identically.
export default function DownloadCsvButton({ onDownload, disabled, label = 'Download' }) {
  return (
    <Button variant="secondary" icon={Download} onClick={onDownload} disabled={disabled}>
      {label}
    </Button>
  );
}
