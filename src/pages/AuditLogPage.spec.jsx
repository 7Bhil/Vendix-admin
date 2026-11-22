import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuditLogPage, { buildAuditCsv } from './AuditLogPage.jsx';
import { adminService } from '../api/adminService';

vi.mock('../api/adminService', () => ({
  adminService: {
    getAuditLogs: vi.fn(),
  },
}));

const sampleLogs = [
  {
    id: 'audit-1',
    timestamp: '2026-11-22T14:30:00.000Z',
    adminId: 'admin-001',
    adminName: 'Bhilal C.',
    action: 'SUSPEND_MERCHANT',
    targetType: 'SHOP',
    targetId: 3,
    targetName: 'Mode Élégance',
    reason: 'Fraude répétée',
    ipAddress: '197.234.221.10',
  },
  {
    id: 'audit-2',
    timestamp: '2026-11-21T09:15:00.000Z',
    adminId: 'admin-002',
    adminName: 'Modérateur Cotonou',
    action: 'REPORT_DISMISSED',
    targetType: 'REPORT',
    targetId: 'REP-099',
    targetName: 'Épicerie du Port',
    reason: 'Sans fondement',
    ipAddress: '197.234.221.45',
  },
];

describe('AuditLogPage (Journal d’audit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getAuditLogs.mockResolvedValue(sampleLogs);
  });

  it('affiche le tableau chronologique des événements d’audit', async () => {
    render(<AuditLogPage />);

    expect(await screen.findByText('Mode Élégance')).toBeInTheDocument();
    expect(screen.getByText('Épicerie du Port')).toBeInTheDocument();
    expect(screen.getByText('Bhilal C.')).toBeInTheDocument();
    expect(screen.getByText('Suspension boutique')).toBeInTheDocument();
    expect(screen.getByText('Signalement classé')).toBeInTheDocument();
  });

  it('filtre les événements par recherche textuelle et par type d’action', async () => {
    render(<AuditLogPage />);

    await screen.findByText('Mode Élégance');

    fireEvent.change(
      screen.getByLabelText(/Rechercher par boutique ou modérateur/i),
      { target: { value: 'Élégance' } },
    );

    expect(screen.getByText('Mode Élégance')).toBeInTheDocument();
    expect(screen.queryByText('Épicerie du Port')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Filtrer par type d'action/i), {
      target: { value: 'SUSPEND_MERCHANT' },
    });

    await waitFor(() => {
      expect(adminService.getAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ action: 'SUSPEND_MERCHANT' }),
      );
    });
  });

  it('déclenche l’export CSV avec les colonnes attendues', async () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    render(<AuditLogPage />);
    await screen.findByText('Mode Élégance');

    const exportBtn = screen.getByRole('button', { name: /Exporter CSV/i });
    fireEvent.click(exportBtn);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    const csv = buildAuditCsv(sampleLogs);
    expect(csv).toContain('Date & Heure;Administrateur;Action');
    expect(csv).toContain('Mode Élégance');
    expect(csv).toContain('SUSPEND_MERCHANT');
  });
});
