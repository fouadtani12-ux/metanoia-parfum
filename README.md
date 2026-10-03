# METANOÏA PARFUMS | Haute Parfumerie & Boutique En Ligne

Plateforme e-commerce full-stack de haute parfumerie pour la marque de luxe **METANOÏA PARFUMS** (*« Une signature olfactive qui vous ressemble »*).

L'application allie une identité visuelle luxueuse (noir profond `#0B0B0D`, champagne `#D8B08C`, rose gold `#C98F78`, or discret `#C9A46C`) et une architecture logicielle robuste et modulaire intégrant boutique client, API REST, base de données relationnelle et espace administrateur complet.

---

## 1. Fonctionnalités Principales

### A. Boutique Client & Expérience d'Achat
- **Homepage Premium** : Hero cinématique avec flacons d'exception, aura dorée, univers olfactifs (Homme, Femme, Unisexe, Nouveautés, Best-Sellers), sélection signature, histoire de la maison et intégration Instagram (`@metanoia.parfums`).
- **Catalogue & Navigation (`/shop`, `/shop/homme`, `/shop/femme`, `/shop/unisexe`)** :
  - Filtres par univers/genre, famille olfactive (Oriental, Boisé, Floral, Gourmand, Frais, Ambré, Cuiré), fourchette de prix (DH), disponibilité en stock et promotions.
  - Tri par nouveautés, popularité, prix croissant/décroissant, avis.
  - Pagination dynamique.
- **Fiche Produit PDP (`/product/[slug]`)** :
  - Flacon somptueux haute fidélité avec reflets ambrés et caustiques champagne.
  - Pyramide olfactive complète (Notes de tête, Notes de cœur, Notes de fond).
  - Sélection de contenance (30 ml, 50 ml, 75 ml, 100 ml).
  - Gestion du stock en direct (`En stock`, `Dernières pièces`, `Rupture de stock`).
  - Avis clients certifiés avec formulaire de dépôt d'avis.
  - Recommandations intelligentes (*« Vous pourriez aussi aimer »*).
  - Données structurées SEO **JSON-LD Schema.org Product**.
- **Panier Latéral (Cart Drawer)** :
  - Liste d'articles, modification des quantités, suppression.
  - Barre de progression dynamique pour la livraison gratuite (dès 500 DH).
  - Validation des codes privilèges en temps réel (ex: `METANOIA10`, `BIENVENUE20`, `PRIVILEGE50`).
  - Sauvegarde locale et synchronisation de session.
- **Checkout en 4 Étapes (`/checkout`)** :
  - Étape 1 : Coordonnées client (Prénom, Nom, Téléphone, Email).
  - Étape 2 : Adresse de livraison au Maroc (Ville, Région, Rue, Code postal, Instructions).
  - Étape 3 : Mode de livraison avec calcul automatique des tarifs selon la ville (Marrakech, Casablanca, Rabat, Agadir, Tanger, Fès...).
  - Étape 4 : Paiement au choix : Paiement à la livraison (**Cash on Delivery - COD**) ou Carte Bancaire en ligne (Mode sécurisé test).
- **Espace Client (`/account`)** :
  - Suivi de commande avec **chronologie visuelle en 5 étapes** (*Reçue -> Confirmée -> En préparation -> Expédiée -> Livrée*).
  - Possibilité d'annulation de commande avec restauration automatique des stocks.
  - Gestion des flacons favoris (Wishlist).
  - Gestion du profil et des adresses.
- **Pages Institutionnelles & Légales** :
  - `/about` : Histoire de la maison et noblesse des extraits.
  - `/contact` : Conciergerie olfactive, WhatsApp direct, coordonnées Marrakech.
  - `/faq` : Foire aux questions détaillées.
  - `/shipping` : Grille tarifaire et engagements logistiques.
  - `/returns`, `/terms`, `/privacy` : CGV et confidentialité.
  - `404` : Page d'erreur personnalisée dans l'esprit de la marque.

---

### B. Espace Administrateur (`/admin`)
- **Dashboard & Statistiques Exécutives** :
  - Chiffre d'affaires total (DH), Commandes totales, Clients inscrits, Panier moyen.
  - Ventes du jour, Ventes du mois, Unités en stock, Alertes de stock faible et rupture.
  - Graphiques d'évolution des ventes et top des fragrances les plus vendues.
- **Gestion des Produits (`/admin/products`)** :
  - Ajout d'une nouvelle fragrance (nom, slug, description, notes olfactives, prix, prix barré, stock, SKU, code-barres, contenance).
  - Modification, suppression, activation/désactivation immédiate.
- **Gestion des Stocks & Inventaire (`/admin/stocks`)** :
  - Alertes automatiques `STOCK FAIBLE` (<= 4 unités) et `RUPTURE DE STOCK` (0 unité).
  - Décrémentation automatique lors d'une commande passée.
  - Restauration automatique du stock en cas d'annulation de commande.
  - Ajustement manuel du stock avec motif et traçabilité de l'opérateur.
  - Historique complet des mouvements de stock.
- **Gestion des Commandes (`/admin/orders`)** :
  - Notification immédiate de chaque nouvelle commande.
  - Changement de statut (*PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED -> CANCELLED*).
  - Filtrage par statut, date (Aujourd'hui, Cette semaine, Ce mois) et recherche textuelle.
  - Inspection détaillée du destinataire et du contenu du colis.
- **Gestion des Clients (`/admin/customers`)** :
  - Liste des clients, coordonnées, nombre de commandes et valeur totale dépensée.
- **Gestion des Promotions (`/admin/coupons`)** :
  - Création de codes promo (en pourcentage ou montant fixe en DH).
  - Définition du montant d'achat minimum, limite d'utilisation et dates de validité.
- **Modération des Avis (`/admin/reviews`)** :
  - Approbation ou rejet des avis clients.
- **Gestion Logistique & Tarifs (`/admin/shipping`)** :
  - Ajustement des frais de port standard et express par ville du Maroc.
- **Paramètres de la Boutique (`/admin/settings`)** :
  - Nom, slogan, contact, seuil de livraison offerte, Instagram.

---

## 2. Architecture Technique

```
├── server.ts                   # Serveur Express full-stack (API REST, SEO sitemap/robots, Vite middleware)
├── index.html                  # HTML5 optimisé SEO avec polices Cinzel & Cormorant Garamond
├── prisma/
│   └── schema.prisma           # Schéma relationnel Prisma (PostgreSQL)
├── schema.sql                  # Schéma relationnel brut PostgreSQL avec index et contraintes
├── src/
│   ├── main.tsx                # Point d'entrée React
│   ├── App.tsx                 # Routeur applicatif et layout global
│   ├── index.css               # Thème Tailwind CSS, variables de luxe et typographies
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript strictes du domaine
│   ├── data/
│   │   └── mockData.ts         # Données d'initialisation réalistes (16 parfums, 12 commandes, villes marocaines)
│   ├── lib/
│   │   └── store.tsx           # Context & state business logic (panier, commandes, stocks, auth, toasts)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Barre de navigation respectant le contrat à 3 zones
│   │   │   └── Footer.tsx      # Footer complet avec liens et mentions légales
│   │   ├── products/
│   │   │   └── ProductCard.tsx # Carte produit élégante sans pill boxes
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx  # Tiroir panier avec livraison offerte & code promo
│   │   ├── search/
│   │   │   └── SearchModal.tsx # Recherche instantanée (parfums, familles, notes)
│   │   └── ui/
│   │       ├── BrandLogo.tsx   # Logo signature Metanoïa Parfums
│   │       ├── PerfumeBottleGraphic.tsx # Rendu vectoriel de flacon de haute parfumerie
│   │       └── ToastContainer.tsx       # Notifications visuelles discrètes
│   └── pages/
│       ├── HomePage.tsx        # Page d'accueil
│       ├── ShopPage.tsx        # Catalogue boutique avec filtres et pagination
│       ├── ProductDetailPage.tsx # Fiche détaillée avec pyramide olfactive
│       ├── CheckoutPage.tsx    # Processus de commande en 4 étapes
│       ├── AccountPage.tsx     # Espace client et suivi de commande en 5 étapes
│       ├── AuthPage.tsx        # Connexion & inscription
│       ├── StaticPages.tsx     # À propos, Contact, FAQ, Livraison, Retours, CGV, 404
│       └── admin/
│           └── AdminDashboard.tsx # Espace administrateur complet
```

---

## 3. Guide de Démarrage Local

### Prérequis
- Node.js version 18 ou supérieure
- npm version 9 ou supérieure

### Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer le fichier `.env` :
   ```bash
   cp .env.example .env
   ```

3. Lancer l'application en mode développement :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

4. Compiler pour la production :
   ```bash
   npm run build
   ```

5. Lancer en production :
   ```bash
   npm start
   ```

---

## 4. Déploiement en Production

La structure est prête pour un déploiement continu sur **Cloud Run**, **Vercel**, **Railway**, **Render** ou **Docker** :

- **Port** : `3000` (ou défini via la variable `PORT`).
- **Commande de build** : `npm run build`
- **Commande de démarrage** : `npm start`
- Les routes API REST (`/api/*`), le sitemap XML (`/sitemap.xml`) et `robots.txt` sont automatiquement servis par `server.ts`.
