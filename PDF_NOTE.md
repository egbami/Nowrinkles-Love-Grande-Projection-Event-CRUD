# 📄 Génération PDF côté client (Dashboard Admin)

Le dashboard admin génère les PDF **dans le navigateur** via `jspdf` et `jspdf-autotable`.
Ces librairies ne sont pas dans package.json par défaut car elles sont lourdes.

## Installation

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf-autotable
```

## Pourquoi côté client ?

- Les fonctions serverless Vercel ont une limite de 50 MB — puppeteer est exclu.
- `@react-pdf/renderer` nécessite Node.js complet, pas compatible avec Edge Runtime.
- `jspdf` génère directement dans le navigateur → téléchargement immédiat, zéro coût serveur.

## Résultat

Le PDF généré contient :
- En-tête Nowrinkles Love (fond graphite, texte ivoire)
- Tableau coloré (header doré) avec tous les participants
- Date de génération, total, numéros de pages
- Encodage UTF-8 avec BOM (ouverture correcte dans Excel/Word)
