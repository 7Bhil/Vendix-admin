
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MerchantsPage from "./MerchantsPage.jsx";
import { adminService } from "../api/adminService";

vi.mock("../api/adminService", () => ({
  adminService: {
    suspendMerchant: vi.fn(),
  },
}));

const mockShops = [
  {
    id: "shop-1",
    name: "Boutique Test",
    merchant: "Commerçant Test",
    phone: "+2290190000000",
    city: "Parakou",
    category: "Alimentation",
    status: "active",
  },
];

describe("MerchantsPage (Admin)", () => {
  let setShops;

  beforeEach(() => {
    vi.clearAllMocks();
    setShops = vi.fn();
  });

  const openSuspensionModal = () => {
    render(<MerchantsPage shops={mockShops} setShops={setShops} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Suspendre", exact: true }),
    );

    fireEvent.change(screen.getByLabelText(/Motif de suspension/i), {
      target: { value: "Non-respect des règles" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer la suspension" }),
    );
  };

  it("suspend une boutique après confirmation du service API", async () => {
    adminService.suspendMerchant.mockResolvedValue({ success: true });

    openSuspensionModal();

    await waitFor(() => {
      expect(adminService.suspendMerchant).toHaveBeenCalledWith(
        "shop-1",
        "Non-respect des règles",
      );
    });

    expect(setShops).toHaveBeenCalled();

    const updateShops = setShops.mock.calls[0][0];
    const updatedShops = updateShops(mockShops);

    expect(updatedShops[0].status).toBe("suspended");
    expect(updatedShops[0].suspensionReason).toBe(
      "Non-respect des règles",
    );
  });

  it("ne modifie pas la boutique lorsque le service API échoue", async () => {
    adminService.suspendMerchant.mockRejectedValue(
      new Error("Erreur serveur"),
    );

    openSuspensionModal();

   const errorMessage = await screen.findByRole("alert");

expect(errorMessage.textContent).toContain("Erreur serveur");

    expect(setShops).not.toHaveBeenCalled();
  });

  it("désactive les boutons de fermeture pendant la suspension", () => {
    adminService.suspendMerchant.mockReturnValue(new Promise(() => {}));

    openSuspensionModal();

    expect(
  screen.getByRole("button", { name: "Annuler" }).disabled,
).toBe(true);

expect(
  screen.getByRole("button", { name: "Suspension en cours..." }).disabled,
).toBe(true);
  });
});
