# NeumaLab — Reglas de Proyecto y Entorno

## 1. Compatibilidad TypeScript con Node 26 y Compilación
- Usa **siempre `import type`** (o modificador `type` inline: `import { valor, type MiTipo }`) para importar interfaces o tipos en todos los archivos `.ts` y `.tsx`. Node 26 ejecuta pruebas `.ts` de forma nativa eliminando `export type`, lo que provoca `SyntaxError` si un tipo se importa como valor.
- Antes de dar por terminada cualquier edición de interfaz o motor, ejecuta:
  1. `./node_modules/.bin/tsc --noEmit` (o `npm run build`) para verificar 0 errores de tipos.
  2. `node --test src/lib/latinProcessor.test.ts` para verificar todas las suites de lógica sin levantar `vitest`.

## 2. Entorno Google Drive FUSE y GitHub Pages
- Este repositorio reside en **Google Drive CloudStorage (FUSE)**. Evita comandos que escaneen masivamente `node_modules/` como `vitest` salvo necesidad explícita; prefiere `node --test` y `rg`.
- En `vite.config.ts`, conserva siempre:
  - `base: './'` (para que las rutas relativas `./assets/...` funcionen en cualquier subruta de GitHub Pages).
  - `cacheDir: '/tmp/neumalab-vite-cache'` (mantiene la caché de Vite fuera de Google Drive FUSE).
- En `.gitignore`, conserva excluidos `node_modules/`, `dist/` y `*.tsbuildinfo`.

## 3. Invariantes del Motor Filológico, GABC y Armonización Modal
- **`src/lib/latinProcessor.ts` (Pronuntiatio Romana):**
  - Mantén el orden de reglas fonéticas: `y -> i` debe aplicarse antes de `ge/gi -> ye/yi`, y `z -> dz` debe usar lookbehind negativo `(?<!t)z` para no corromper `tzi`.
  - Ignora rúbricas aisladas `V/.` y `R/.` al tokenizar palabras latinas para silabeo/acentuación, preservándolas como metadato `versiclePrefix` en `src/lib/gabcEngine.ts`.
- **`src/lib/modalHarmonizer.ts` (Pureza Modal y Prosodia):**
  - No introducir alteraciones cromáticas extrañas (`Do#`, `Re#`, `Fa#`, `Sol#`), acordes disminuidos en estado fundamental ni quintas/octavas paralelas.
  - En sílabas cadenciales con neuma de apoyatura, tomar la **última nota del neuma** como nota objetivo armónica para asegurar reposo sobre la *finalis* del modo.
  - Toda edición debe mantener aprobadas al 100% las 5 verificaciones de `auditHarmonization()` en las 5 piezas oficiales de `VATICANA_REPERTOIRE` y los 3 estilos.
