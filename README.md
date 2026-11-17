# NeumaLab

**Portal Interactivo de Canto Gregoriano, Filología Latina Litúrgica, Semiología y Acompañamiento al Órgano.**

**Sitio en vivo:** [https://ing-edinguer.github.io/NeumaLab/](https://ing-edinguer.github.io/NeumaLab/)

NeumaLab es una aplicación web **100% client-side** construida con React, TypeScript, Vite y Tailwind CSS, optimizada para desplegarse directamente como sitio estático en GitHub Pages.

---

## Características principales

### Estudio Principal (Procesador Latino y Armonización Modal)
- **Procesador de Latín Eclesiástico (`src/lib/latinProcessor.ts`):** silabeador litúrgico automático (diptongos, dígrafos y grupos consonánticos), detector de acentos tónicos y secundarios con edición interactiva por clic, clasificación rítmica (cadencias espondaicas `´ _` y dactílicas `´ _ _`), transcripción fonética en *Pronuntiatio Romana* para hispanohablantes y glosario litúrgico interno (`src/data/liturgicalDictionary.ts`).
- **Entrada Multimodal y Motor GABC (`src/lib/gabcEngine.ts`):** edición bidireccional mediante sintaxis rápida (`[Re-Fa]`, `[Re.]`, `[Re_]`, `['Re]`), editor visual sobre tetragrama (`TetragramaRenderer`), teclado virtual MIDI y código **GABC**, con 5 piezas precargadas de la *Editio Vaticana* (*Salve Regina*, *Veni Creator Spiritus*, *Adoro te devote*, *Ubi caritas et amor*, *Regina Caeli*).
- **Armonizador Modal al Órgano (`src/lib/modalHarmonizer.ts`):** generación de acompañamiento diatónico estricto (sin alteraciones cromáticas ajenas al modo) en tres estilos (*Solesmes / Desrocquettes*, *Potiron a 4 voces + pedal* y *Pedagógico a 3 voces sin pedal*), con partitura combinada canto + órgano (`CombinedChantOrganScore`) y auto-auditoría modal (`auditHarmonization`).
- **Síntesis de Órgano en Tiempo Real (`src/lib/organAudioEngine.ts`):** motor Web Audio API con registros (`Bourdon 8'`, `Salicional / Flute 8'`, `Subbajo 16'`), selección de modo de reproducción (*Canto + Órgano*, *Solo Órgano*, *Solo Canto*) y reverberación acústica de catedral (`ConvolverNode`).

### Siete Pilares Formativos y de Investigación (`src/components/pillars/`)
1. **Pilar I · Octoechos y Salmodia:** lectura en tetragrama, claves de Do/Fa, los 8 modos eclesiásticos y salmodia interactiva.
2. **Pilar II · Semiología y Paleografía:** tabla comparativa de neumas (*Triplex*), paleografía comparada (Vaticana, St. Gallen y Laon 239) e historia crítica del canto litúrgico.
3. **Pilar III · Escuela de Órgano:** tratado de armonía modal gregoriana, rítmica del acompañamiento (*ictus*, *arsis*, *thesis*) y registración litúrgica.
4. **Pilar IV · Schola y Quironimia:** simulador visual de quironimia, laboratorio de vocalización y pedagogía coral.
5. **Pilar V · Repertorio y Magisterio:** fichas analíticas de repertorio y corpus documental del Magisterio sobre música sagrada.
6. **Pilar VI · Escritura Digital (GABC):** sintaxis GABC, entorno profesional GregorioTeX + LuaLaTeX en VS Code y ecosistema de herramientas digitales.
7. **Pilar VII · AISCGre y Fonoteca:** investigación reciente (*Graduale Novum*), directorio de centros académicos y bibliografía/fonoteca comentada.

---

## Stack tecnológico

- **Frontend:** React 19 + TypeScript (`~5.7`)
- **Empaquetador:** Vite 6 (`base: './'` para compatibilidad con subrutas de GitHub Pages)
- **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite`) e iconos `lucide-react`
- **Audio y notación:** Web Audio API + renderizado SVG en cliente (sin backend requerido)

---

## Desarrollo local

Requisitos: **Node.js 20+** y **npm**.

```zsh
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar pruebas unitarias (filología latina, motor GABC y armonización modal)
npm test

# Verificación de tipos y compilación de producción (genera ./dist)
npm run build

# Previsualizar el bundle compilado
npm run preview
```
