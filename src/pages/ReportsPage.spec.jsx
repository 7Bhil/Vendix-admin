
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import ReportsPage from './ReportsPage.jsx'
import { adminService } from '../api/adminService'

vi.mock('../api/adminService', () => ({
  adminService: {
    updateReportStatus: vi.fn(),
    suspendMerchant: vi.fn(),
  },
}))

const mockReports = [
  {
    id: 'report-1',
    shopId: 'shop-1',
    shopName: 'Boutique Test',
    reporter: 'Client Test',
    reason: 'Produit non conforme',
    description: 'Le produit reçu ne correspond pas à la commande.',
    submittedAt: '2026-11-15T10:00:00Z',
    status: 'pending',
  },
]

const mockShops = [
  {
    id: 'shop-1',
    name: 'Boutique Test',
    status: 'active',
  },
]

describe('ReportsPage (Admin)', () => {
  let setReports
  let setShops

  beforeEach(() => {
    vi.clearAllMocks()
    setReports = vi.fn()
    setShops = vi.fn()
  })

  const openReportModal = () => {
    render(
      <ReportsPage
        reports={mockReports}
        setReports={setReports}
        setShops={setShops}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /Voir les détails/i }),
    )
  }

  it('classe un signalement sans suite après confirmation de l’API', async () => {
    adminService.updateReportStatus.mockResolvedValue({ success: true })

    openReportModal()

    fireEvent.click(
      screen.getByRole('button', { name: 'Classer sans suite' }),
    )

    await waitFor(() => {
      expect(adminService.updateReportStatus).toHaveBeenCalledWith(
        'report-1',
        'dismissed',
        'Signalement classé sans suite.',
      )
    })

    expect(setReports).toHaveBeenCalled()
    expect(setShops).not.toHaveBeenCalled()

    const updateReports = setReports.mock.calls[0][0]
    const updatedReports = updateReports(mockReports)

    expect(updatedReports[0].status).toBe('dismissed')
  })

  it('envoie un avertissement après confirmation de l’API', async () => {
    adminService.updateReportStatus.mockResolvedValue({ success: true })

    openReportModal()

    fireEvent.change(
      screen.getByLabelText(/Motif ou commentaire de traitement/i),
      { target: { value: 'Attention aux produits vendus.' } },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Envoyer un avertissement' }),
    )

    await waitFor(() => {
      expect(adminService.updateReportStatus).toHaveBeenCalledWith(
        'report-1',
        'warning',
        'Attention aux produits vendus.',
      )
    })

    expect(setReports).toHaveBeenCalled()
    expect(setShops).not.toHaveBeenCalled()
  })

  it('suspend la boutique et met à jour le signalement', async () => {
    adminService.updateReportStatus.mockResolvedValue({ success: true })
    adminService.suspendMerchant.mockResolvedValue({ success: true })

    openReportModal()

    fireEvent.change(
      screen.getByLabelText(/Motif ou commentaire de traitement/i),
      { target: { value: 'Non-respect des règles.' } },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Suspendre la boutique' }),
    )

    await waitFor(() => {
      expect(adminService.updateReportStatus).toHaveBeenCalledWith(
        'report-1',
        'suspended',
        'Non-respect des règles.',
      )

      expect(adminService.suspendMerchant).toHaveBeenCalledWith(
        'shop-1',
        'Non-respect des règles.',
      )
    })

    expect(setReports).toHaveBeenCalled()
    expect(setShops).toHaveBeenCalled()

    const updateReports = setReports.mock.calls[0][0]
    const updatedReports = updateReports(mockReports)

    expect(updatedReports[0].status).toBe('suspended')

    const updateShops = setShops.mock.calls[0][0]
    const updatedShops = updateShops(mockShops)

    expect(updatedShops[0].status).toBe('suspended')
    expect(updatedShops[0].suspensionReason).toBe(
      'Non-respect des règles.',
    )
  })

  it('ne modifie pas les données locales lorsque l’API échoue', async () => {
    adminService.updateReportStatus.mockRejectedValue(
      new Error('Erreur serveur'),
    )

    openReportModal()

    fireEvent.click(
      screen.getByRole('button', { name: 'Classer sans suite' }),
    )

    const errorMessage = await screen.findByRole('alert')

    expect(errorMessage.textContent).toContain('Erreur serveur')
    expect(setReports).not.toHaveBeenCalled()
    expect(setShops).not.toHaveBeenCalled()
  })

  it('ne modifie pas le signalement si la suspension de la boutique échoue', async () => {
    adminService.suspendMerchant.mockRejectedValue(
      new Error('Échec de suspension'),
    )

    openReportModal()

    fireEvent.change(
      screen.getByLabelText(/Motif ou commentaire de traitement/i),
      { target: { value: 'Fraude avérée' } },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Suspendre la boutique' }),
    )

    const errorMessage = await screen.findByRole('alert')

    expect(errorMessage.textContent).toContain('Échec de suspension')
    expect(adminService.updateReportStatus).not.toHaveBeenCalled()
    expect(setReports).not.toHaveBeenCalled()
    expect(setShops).not.toHaveBeenCalled()
  })
})
