import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DashboardPage from "./DashboardPage.jsx";

describe("DashboardPage (Admin)", () => {
  it("affiche les indicateurs consolidés du tableau de bord", () => {
    const mockShops = [
      { id: "shop-1", name: "Boutique Test", status: "active" },
    ];
    const mockReports = [
      {
        id: "rep-1",
        shopName: "Boutique Test",
        reporter: "Client A",
        reason: "Produit non conforme",
        status: "pending",
        submittedAt: "2026-11-15T10:00:00Z",
      },
    ];

    render(<DashboardPage shops={mockShops} reports={mockReports} dashboardStats={{ transactionVolumeXof: 987654 }} />);

    expect(screen.getByText("Tableau de bord")).toBeDefined();
    expect(screen.getByText("Boutiques actives")).toBeDefined();
    expect(screen.getByText("Signalements récents")).toBeDefined();
    expect(screen.getByText("Produit non conforme")).toBeDefined();

    expect(screen.getByText((content) =>content.replace(/\s/g, '') === '987654FCFA')).toBeDefined();
  });
});
