
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AuditLogPage from "./AuditLogPage.jsx";
import { adminService } from "../api/adminService";

vi.mock("../api/adminService", () => ({
  adminService: {
    getAuditLogs: vi.fn(),
  },
}));

const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const mockAuditLogs = [
  {
    id: "audit-001",
    timestamp: new Date().toISOString(),
    adminId: "admin-001",
    adminName: "Bhilal C.",
    action: "SUSPEND_MERCHANT",
    targetType: "SHOP",
    targetId: "shop-1",
    targetName: "Boutique Test",
    reason: "Non-respect des règles",
    previousValue: "active",
    newValue: "suspended",
    ipAddress: "127.0.0.1",
  },
  {
    id: "audit-002",
    timestamp: getDateDaysAgo(10),
    adminId: "admin-002",
    adminName: "Admin Secondaire",
    action: "REPORT_DISMISSED",
    targetType: "REPORT",
    targetId: "report-2",
    targetName: "Signalement #2",
    reason: "Signalement vérifié",
    previousValue: "pending",
    newValue: "dismissed",
    ipAddress: "127.0.0.1",
  },
  {
    id: "audit-003",
    timestamp: new Date().toISOString(),
    adminId: "admin-003",
    adminName: "Bhilal C.",
    action: "REPORT_WARNING",
    targetType: "REPORT",
    targetId: "report-3",
    targetName: "Signalement #3",
    reason: "Avertissement envoyé",
    previousValue: "pending",
    newValue: "warning",
    ipAddress: "127.0.0.1",
  },
];

const renderAuditPage = () =>
  render(
    <MemoryRouter>
      <AuditLogPage />
    </MemoryRouter>,
  );

describe("AuditLogPage (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getAuditLogs.mockResolvedValue(mockAuditLogs);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche les événements du journal après le chargement", async () => {
    renderAuditPage();

    expect(
      await screen.findByText("Boutique Test"),
    ).toBeTruthy();

    expect(screen.getAllByText("Bhilal C.").length).toBe(2);
    expect(screen.getByText("Suspension")).toBeTruthy();
    expect(screen.getByText("Non-respect des règles")).toBeTruthy();

    expect(adminService.getAuditLogs).toHaveBeenCalledOnce();
  });

  it("recherche un événement par nom de commerçant", async () => {
    renderAuditPage();

    await screen.findByText("Boutique Test");

    fireEvent.change(
      screen.getByPlaceholderText(
        /Rechercher un commerçant ou un administrateur/i,
      ),
      { target: { value: "Boutique Test" } },
    );

    expect(screen.getByText("Boutique Test")).toBeTruthy();
    expect(screen.queryByText("Signalement #2")).toBeNull();
    expect(screen.queryByText("Signalement #3")).toBeNull();
  });

  it("filtre les événements par type d'action", async () => {
    renderAuditPage();

    await screen.findByText("Boutique Test");

    fireEvent.change(
      screen.getByDisplayValue("Toutes les actions"),
      { target: { value: "REPORT_DISMISSED" } },
    );

    expect(screen.getAllByText("Signalement rejeté").length).toBe(2);
    expect(screen.getByText("Signalement #2")).toBeTruthy();
    expect(screen.queryByText("Boutique Test")).toBeNull();
    expect(screen.queryByText("Signalement #3")).toBeNull();
  });

  it("filtre les événements des sept derniers jours", async () => {
    renderAuditPage();

    await screen.findByText("Boutique Test");

    fireEvent.change(
      screen.getByDisplayValue("Toutes les périodes"),
      { target: { value: "7days" } },
    );

    expect(screen.getByText("Boutique Test")).toBeTruthy();
    expect(screen.getByText("Signalement #3")).toBeTruthy();
    expect(screen.queryByText("Signalement #2")).toBeNull();
  });

  it("affiche un message lorsque le service API échoue", async () => {
    adminService.getAuditLogs.mockRejectedValue(
      new Error("Erreur serveur"),
    );

    renderAuditPage();

    expect(await screen.findByText("Erreur serveur")).toBeTruthy();
    expect(screen.queryByText("Boutique Test")).toBeNull();
  });

  it("déclenche le téléchargement du fichier CSV", async () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const clickSpy = vi.spyOn(
      HTMLAnchorElement.prototype,
      "click",
    ).mockImplementation(() => {});

    renderAuditPage();

    await screen.findByText("Boutique Test");

    fireEvent.click(
      screen.getByRole("button", { name: /Exporter en CSV/i }),
    );

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(clickSpy).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });

    expect(clickSpy.mock.instances[0].download).toMatch(
      /^journal-audit-\d{4}-\d{2}-\d{2}\.csv$/,
    );
  });

  it("désactive l'export CSV lorsqu'aucun événement n'est disponible", async () => {
  adminService.getAuditLogs.mockResolvedValue([]);

  renderAuditPage();

  const exportButton = screen.getByRole("button", {
    name: /Exporter en CSV/i,
  });

  await waitFor(() => {
  expect(exportButton.disabled).toBe(true);
});

  expect(screen.getByText("Aucun événement trouvé")).toBeTruthy();
});
});
