# Vendix Admin — Console Super-Administrateur

Application web dédiée à la supervision de la plateforme Vendix, à l'annuaire des commerçants et au traitement des signalements anti-fraude.

---

## 1. Démarrage Rapide

```bash
# Cloner le dépôt et basculer sur la branche de travail
git clone https://github.com/7Bhil/Vendix-admin.git
cd Vendix-admin
git checkout -b feature/nom-de-votre-tache

# Installer les dépendances
npm install

# Créer son fichier d'environnement local
cp .env.example .env

# Lancer le serveur de développement Vite
npm run dev
```

L'application démarre par défaut sur `http://localhost:5174` (ou `5173`) et redirige automatiquement vers `/admin`.

---

## 2. Architecture & Organisation du Code

```text
src/
├── api/
│   └── adminService.js       # Couche d'échange API (bascule auto entre mocks et API réelle)
├── components/
│   └── layout/
│       └── AdminLayout.jsx   # Barre latérale (Sidebar) et en-tête de la console
├── mocks/
│   └── adminData.json        # Données de test (KPIs, commerçants, signalements)
├── pages/
│   ├── DashboardPage.jsx     # Écran /admin (Métriques, volume FCFA, état des services)
│   ├── MerchantsPage.jsx     # Écran /admin/commercants (Annuaire et suspension)
│   └── ReportsPage.jsx       # Écran /admin/signalements (Modération des litiges)
├── App.jsx                   # Configuration des routes (BrowserRouter)
└── main.jsx                  # Point d'entrée React
```

---

## 3. Variables d'Environnement (`.env`)

| Variable | Description | Valeur par défaut |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL de l'API backend NestJS | `http://localhost:3000` |
| `VITE_USE_MOCKS` | Activer ou désactiver les données de test locales | `true` (mettre `false` pour l'API réelle) |

---

## 4. Contrats d'API & Endpoints

Se référer au document de synthèse : `docs/Contrats_API_Vendix.pdf` situé dans le dépôt principal.

- `GET /admin/dashboard` : Métriques globales de supervision.
- `GET /admin/merchants` : Liste des commerces inscrits.
- `POST /admin/merchants/:id/suspend` : Action de suspension / réactivation d'un compte.
- `GET /admin/reports` : File d'attente des signalements citoyens.
- `PATCH /admin/reports/:id` : Mise à jour du statut (`EN_COURS`, `RESOLU`, `REJETE`).

---

## 5. Scripts Disponibles

- `npm run dev` : Démarre le serveur local de dev.
- `npm run build` : Compile l'application pour la production.
- `npm run preview` : Prévisualise le build de production.
