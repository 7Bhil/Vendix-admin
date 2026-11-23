
import { adminService } from './adminService';

describe('adminService - journal des audits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enregistre une entrée d’audit lors de la suspension d’un commerçant', async () => {
    localStorage.setItem(
      'vendix_admin_merchants',
      JSON.stringify([
        {
          id: 42,
          name: 'Boutique Test',
          status: 'active',
        },
      ]),
    );

    localStorage.setItem(
      'vendix_admin_audit_logs',
      JSON.stringify([]),
    );

    const result = await adminService.suspendMerchant(
      42,
      'Suspicion de fraude',
    );

    const auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(result.data.status).toBe('suspended');
    expect(auditLogs).toHaveLength(1);

    expect(auditLogs[0]).toMatchObject({
      action: 'SUSPEND_MERCHANT',
      targetType: 'SHOP',
      targetId: 42,
      targetName: 'Boutique Test',
      reason: 'Suspicion de fraude',
      previousValue: 'active',
      newValue: 'suspended',
    });

    expect(new Date(auditLogs[0].timestamp).toString())
      .not.toBe('Invalid Date');
  });

  it('ne crée pas de journal si le commerçant est introuvable', async () => {
    localStorage.setItem(
      'vendix_admin_merchants',
      JSON.stringify([]),
    );

    localStorage.setItem(
      'vendix_admin_audit_logs',
      JSON.stringify([]),
    );

    await expect(
      adminService.suspendMerchant(
        999,
        'Motif de test',
      ),
    ).rejects.toThrow('Commerçant introuvable.');

    const auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(auditLogs).toHaveLength(0);
  });


  it('enregistre une entrée REPORT_DISMISSED lors du rejet', async () => {
    localStorage.setItem(
      'vendix_admin_reports',
      JSON.stringify([
        {
          id: 101,
          shopId: 3,
          shopName: 'Mode Élégance',
          status: 'pending',
        },
      ]),
    );

    localStorage.setItem('vendix_admin_audit_logs', JSON.stringify([]));

    await adminService.updateReportStatus(
      101,
      'dismissed',
      'Signalement non fondé après vérification.',
    );

    const auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0]).toMatchObject({
      action: 'REPORT_DISMISSED',
      targetType: 'REPORT',
      targetId: 101,
      targetName: 'Signalement #101 — Mode Élégance',
      reason: 'Signalement non fondé après vérification.',
      previousValue: 'pending',
      newValue: 'dismissed',
    });
  });

  it('enregistre une entrée REPORT_WARNING lors d’un avertissement', async () => {
    localStorage.setItem(
      'vendix_admin_reports',
      JSON.stringify([
        {
          id: 102,
          shopId: 3,
          shopName: 'Mode Élégance',
          status: 'pending',
        },
      ]),
    );

    localStorage.setItem('vendix_admin_audit_logs', JSON.stringify([]));

    await adminService.updateReportStatus(
      102,
      'warning',
      'Un avertissement a été adressé.',
    );

    const auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0]).toMatchObject({
      action: 'REPORT_WARNING',
      targetId: 102,
      reason: 'Un avertissement a été adressé.',
      previousValue: 'pending',
      newValue: 'warning',
    });
  });

  it('ne crée pas de doublon de journal pour une suspension issue d’un signalement', async () => {
    localStorage.setItem(
      'vendix_admin_reports',
      JSON.stringify([
        {
          id: 103,
          shopId: 3,
          shopName: 'Mode Élégance',
          status: 'pending',
        },
      ]),
    );

    localStorage.setItem(
      'vendix_admin_merchants',
      JSON.stringify([
        {
          id: 3,
          name: 'Mode Élégance',
          status: 'active',
        },
      ]),
    );

    localStorage.setItem('vendix_admin_audit_logs', JSON.stringify([]));

    await adminService.updateReportStatus(
      103,
      'suspended',
      'Suspicion de fraude.',
    );

    let auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(auditLogs).toHaveLength(0);

    await adminService.suspendMerchant(3, 'Suspicion de fraude.');

    auditLogs = JSON.parse(
      localStorage.getItem('vendix_admin_audit_logs'),
    );

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].action).toBe('SUSPEND_MERCHANT');
  });

});
