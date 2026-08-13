import React, { useState } from 'react';
import { PhoneIncoming } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import CallLogTable from '../../components/ui/CallLogTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import CallCenterModal from '../../components/complaints/CallCenterModal';
import CallDetailDrawer from '../../components/complaints/CallDetailDrawer';
import { useCalls } from '../../context/CallsContext';
import { usePagination } from '../../hooks/usePagination';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

function matchesSearch(call, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [call.phoneNumber, call.notes, call.handledBy]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function RegistryHeadCallCenterPage() {
  const { calls } = useCalls();
  const [showCallCenter, setShowCallCenter] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [search, setSearch] = useState('');

  const sortedCalls = [...calls]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((call) => matchesSearch(call, search));
  const pagination = usePagination(sortedCalls, 10, search);

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title="Call Center"
        subtitle="Every logged call, caller lookups, complaint links, and outcomes."
        actions={
          <Button variant="primary" icon={PhoneIncoming} onClick={() => setShowCallCenter(true)}>
            Simulate Incoming Call
          </Button>
        }
      />

      <div className="filter-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by phone number, notes, or handled by..."
        />
      </div>

      <CallLogTable calls={pagination.pageItems} onViewDetails={(call) => setSelectedCall(call)} />

      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <CallCenterModal open={showCallCenter} onClose={() => setShowCallCenter(false)} />

      <CallDetailDrawer
        open={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        call={selectedCall}
      />
    </AppShell>
  );
}
