import { getSubStatusMeta, getComplaintOutcomeSummary } from '../constants/complaintStatus';
import { CATEGORY_LABELS } from '../constants/complaintCategories';
import { offices, departments } from '../data/mockOfficers';

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Excel-openable output with no extra dependency — SpreadsheetML (Excel's own plain-XML
// workbook format from Excel 2003 onward) rather than a real binary .xlsx, which would need a
// library like SheetJS. Excel opens this natively with no "format doesn't match extension"
// warning, unlike the common HTML-table-saved-as-.xls trick.
function buildSpreadsheetXml(sheetName, headers, rows) {
  const cell = (value) => `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
  const headerRow = `<Row>${headers.map(cell).join('')}</Row>`;
  const dataRows = rows.map((row) => `<Row>${row.map(cell).join('')}</Row>`).join('');
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${xmlEscape(sheetName)}">
  <Table>
   ${headerRow}
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

// Shared by every "download this list" button — one place building the workbook XML and
// triggering the download instead of each list page growing its own slightly different copy.
function downloadExcel(filename, sheetName, headers, rows) {
  const xml = buildSpreadsheetXml(sheetName, headers, rows);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const COMPLAINT_LIST_HEADERS = ['Complaint Number', 'Subject', 'Category', 'Status', 'Victim', 'Alleged Violator', 'Office', 'Department', 'Date Filed'];

function complaintToRow(c) {
  return [
    c.complaintNumber || '',
    c.subject,
    CATEGORY_LABELS[c.category] || c.category,
    getSubStatusMeta(c.subStatus).label,
    c.victim?.name || '',
    c.allegedViolator?.name || '',
    offices.find((o) => o.id === c.office)?.name || '',
    departments.find((d) => d.id === c.department)?.name || '',
    c.dateFiled,
  ];
}

// `complaints` should be the full filtered set (not just the current page) so the download
// actually reflects what the filters/search say it does, not an arbitrary page of it.
export function downloadComplaintsExcel(complaints, filenamePrefix) {
  downloadExcel(`${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xls`, filenamePrefix.slice(0, 31), COMPLAINT_LIST_HEADERS, complaints.map(complaintToRow));
}

export const OFFENDER_LIST_HEADERS = ['Alleged Violator', 'Phone', 'Email', 'Complaint Count', 'Categories', 'Most Recent Complaint'];

function offenderToRow(o) {
  return [
    o.name,
    o.phone || '',
    o.email || '',
    o.complaintCount,
    o.categories.map((cat) => CATEGORY_LABELS[cat] || cat).join('; '),
    o.mostRecentDate,
  ];
}

export function downloadOffendersExcel(offenders, filenamePrefix) {
  downloadExcel(`${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xls`, filenamePrefix.slice(0, 31), OFFENDER_LIST_HEADERS, offenders.map(offenderToRow));
}

// A single complaint gets a readable plain-text report instead of a one-row spreadsheet —
// there's room to include everything on the detail page (people, investigation findings,
// activity log) in a form meant to be read/printed/filed, not dropped into a spreadsheet.
export function downloadComplaintReport(complaint) {
  const officeName = offices.find((o) => o.id === complaint.office)?.name || '—';
  const departmentName = departments.find((d) => d.id === complaint.department)?.name || '—';
  const line = (label, value) => `${label}: ${value ?? '—'}`;
  const rule = '─'.repeat(60);

  const lines = [
    `${complaint.complaintNumber || 'Complaint'} — ${complaint.subject}`,
    rule,
    line('Status', getSubStatusMeta(complaint.subStatus).label),
    line('Category', CATEGORY_LABELS[complaint.category] || complaint.category),
    line('Date Filed', complaint.dateFiled),
    line('Handling Office', officeName),
    line('Handling Department', departmentName),
    line('Outcome', getComplaintOutcomeSummary(complaint)),
    '',
    'DESCRIPTION',
    complaint.description || '—',
    '',
    'VICTIM',
    line('Name', complaint.victim?.name),
    line('Gender', complaint.victim?.gender),
    line('Phone', complaint.victim?.phone),
    line('Email', complaint.victim?.email),
    line('Address', complaint.victim?.address),
  ];

  (complaint.additionalVictims || []).forEach((v, idx) => {
    lines.push('', `ADDITIONAL VICTIM ${idx + 2}`, line('Name', v.name), line('Phone', v.phone), line('Address', v.address));
  });

  lines.push(
    '',
    'ALLEGED VIOLATOR',
    complaint.allegedViolator?.unidentified
      ? 'Not yet identified.'
      : [
        line('Name', complaint.allegedViolator?.name),
        line('Gender', complaint.allegedViolator?.gender),
        line('Phone', complaint.allegedViolator?.phone),
        line('Email', complaint.allegedViolator?.email),
        line('Address', complaint.allegedViolator?.address),
      ].join('\n'),
  );

  (complaint.additionalViolators || []).forEach((v, idx) => {
    lines.push('', `ADDITIONAL VIOLATOR ${idx + 2}`, line('Name', v.name), line('Phone', v.phone), line('Address', v.address));
  });

  if (complaint.filedBy?.type === 'group') {
    lines.push(
      '',
      'FILED BY',
      line('Type', 'Group / Committee'),
      line('Group Name', complaint.filedBy.groupName),
      line('Representative', complaint.filedBy.representativeName),
      line('Representative Phone', complaint.filedBy.representativePhone),
    );
  }

  if (complaint.investigation?.finding || complaint.investigation?.recommendation) {
    lines.push(
      '',
      'INVESTIGATION FINDINGS',
      line('Finding', complaint.investigation.finding),
      line('Recommendation', complaint.investigation.recommendation),
    );
  }

  if (complaint.investigation?.activities?.length) {
    lines.push('', `INVESTIGATION ACTIVITIES (${complaint.investigation.activities.length})`);
    complaint.investigation.activities.forEach((a) => {
      lines.push(`- [${a.happenedOn || a.loggedAt}] ${a.type} with ${a.withParty}: ${a.summary}`);
    });
  }

  lines.push('', `ACTIVITY LOG (${complaint.activityLog.length})`);
  [...complaint.activityLog].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).forEach((entry) => {
    lines.push(`- [${new Date(entry.timestamp).toLocaleString()}] ${entry.message} — ${entry.actor}`);
  });

  downloadTextFile(`${complaint.complaintNumber || complaint.id}-report.txt`, lines.join('\n'));
}
