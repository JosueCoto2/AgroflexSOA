# 🎨 Design System de AgroFlex — Guía de Referencia

> **Basado en el logo oficial de AgroFlex**
> Estos colores y estilos son la fuente de verdad para toda la interfaz.

---

## 📋 Archivos del Sistema

- `src/utils/constants.js` — Constantes de colores, tipografía, espaciado
- `src/utils/formatters.js` — Funciones de formateo de datos (precios, fechas, etc.)
- `tailwind.config.js` — Configuración Tailwind con paleta de colores
- `src/index.css` — CSS variables globales y componentes reutilizables

---

## 🎯 Paleta de Colores

### Verde Principal (#1E7A45) — Texto "AGRO" del logo
Usado para botones CTA, links activos, navbar, hero background.

```jsx
// En JSX con Tailwind:
<button className="bg-green-600 text-white">...</button>
<div className="border-green-200">...</div>

// En CSS puro:
<div style={{ backgroundColor: 'var(--af-green-600)' }}>...</div>
```

**Escala completa:**
- `green-50` — Fondos sutiles, hover de listas
- `green-100` — Badges, tags
- `green-600` — **PRINCIPAL** — botones, links
- `green-900` — Navbar, hero, footer

---

### Verde Lima (#6ABF3A) — Hoja del logo
Acento vivo para destacar elementos (insignias, precios).

```jsx
<span className="text-lime-500">$12.50 verificado</span>
<img className="border-lime-200" />
```

**Escala:**
- `lime-50` — Fondos de notificaciones éxito
- `lime-200` — Tags de categoría
- `lime-500` — **ACENTO** — insignias, precios destacados

---

### Gris Slate (#3A4A52) — Texto "FLEX" del logo
Elementos neutros, UI, texto body.

```jsx
<p className="text-slate-700">Texto del cuerpo</p>
<span className="text-slate-500">Texto secundario</span>
```

**Escala:**
- `slate-50` — Fondo página
- `slate-700` — **BODY TEXT** — texto principal
- `slate-900` — Títulos h1, h2, h3

---

## 🔘 Componentes Estándar

### Botones

```jsx
// Primario — verde
<button className="btn-primary">Publicar mi cosecha</button>

// Secundario — outline verde
<button className="btn-secondary">Más información</button>

// Ghost blanco — para fondos oscuros (hero, navbar)
<button className="btn-ghost-white">Buscar lotes</button>
```

### Badges

```jsx
// Categoría (Hortalizas, Frutas)
<span className="badge-category">Hortalizas</span>

// Verificado ✓
<span className="badge-verified">✓ Verificado</span>

// Estados de orden
<span className="badge-liberado">Pago Liberado</span>
<span className="badge-escrow">En escrow</span>
<span className="badge-en-ruta">En camino</span>
<span className="badge-disputa">En disputa</span>
```

### Cards

```jsx
<div className="card">
  <h3 className="text-h3 text-green-900">Jitomate Saladette</h3>
  <p className="text-sm text-slate-600">Puebla</p>
  <p className="text-md font-medium text-green-600">$8.50/kg</p>
</div>
```

### Inputs

```jsx
<label className="field-label">Correo</label>
<input className="input-field" placeholder="tu@ejemplo.com" />
```

---

## 📝 Tipografía

Usa las clases de fontSize definidas en tailwind.config.js:

```jsx
<h1 className="text-hero">Vende tu cosecha directo</h1>
<h2 className="text-h1">¿Cómo funciona?</h2>
<h3 className="text-h2">Paso 1: Regístrate</h3>
<p className="text-body">Texto normal del cuerpo</p>
<span className="text-sm">Texto pequeño o caption</span>
<span className="text-label uppercase">HORTALIZAS</span>
```

**Reglas:**
- Solo `font-medium` (500) — Nunca `font-bold` (700)
- Usa `font-shadow` en héroe: `text-hero`
- Labels en uppercase: `text-label uppercase`

---

## 🎨 Formateos de Datos

Importa desde `src/utils/formatters.js`:

```jsx
import { 
  formatPrecio, 
  formatCantidad, 
  formatFecha,
  formatEstrellas,
  getBadgeClase,
  getLabelEstado,
  getIniciales,
  getColorAvatar 
} from '@/utils/formatters'

// Precio: $12.50
<span>{formatPrecio(12.5)}</span>

// Cantidad: 500 kg
<span>{formatCantidad(500, 'kg')}</span>

// Fecha: 15 de marzo de 2026
<span>{formatFecha('2026-03-15')}</span>

// Estrellas: { llenas: 4, vacia: 1, puntuacion: "4.0" }
const stars = formatEstrellas(4.0)
{Array(stars.llenas).fill('★')} {Array(stars.vacia).fill('☆')}

// Clase de badge por estado
<span className={getBadgeClase('PAGO_LIBERADO')}>Completado</span>

// Etiqueta legible de estado
<span>{getLabelEstado('EN_TRANSITO')}</span>  // "En camino"

// Iniciales: "JM"
<div>{getIniciales('Juan', 'Mendoza')}</div>

// Color avatar determinístico
const { bg, text } = getColorAvatar('Juan')
<div style={{ backgroundColor: bg, color: text }}>JM</div>
```

---

## 🎲 Constantes Avanzadas

Importa desde `src/utils/constants.js`:

```jsx
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  RADIUS, 
  SHADOWS,
  TRANSITIONS,
  Z_INDEX 
} from '@/utils/constants'

// CSS-in-JS
<div style={{
  backgroundColor: COLORS.green[600],
  padding: SPACING.lg,
  borderRadius: RADIUS.lg,
  boxShadow: SHADOWS.md,
  transition: TRANSITIONS.normal
}}>
  Blue
</div>

// En media queries o CSS puro
@media (min-width: ${BREAKPOINTS.md}) {
  ...
}
```

---

## ✅ Reglas Obligatorias

1. **NUNCA hardcodees colores.** Siempre usa:
   - Clases Tailwind: `bg-green-600`, `text-slate-700`, `border-lime-200`
   - O variables CSS: `var(--af-green-600)`, `var(--af-text-body)`

2. **NUNCA uses `text-gray-*`.** Usa `text-slate-*` (el gris viene del logo)

3. **Para botones oscuros** (hero, navbar verde):
   ```jsx
   <button className="btn-ghost-white">Entrar</button>
   ```

4. **Para botones claros** (fondo blanco):
   ```jsx
   <button className="btn-primary">Publicar</button>
   <button className="btn-secondary">Más info</button>
   ```

5. **Solo `font-medium`** para énfasis. Nunca `font-bold`.

6. **Labels SIEMPRE uppercase:**
   ```jsx
   <span className="text-label uppercase">Hortalizas</span>
   ```

7. **Min-height de buttons/inputs: 44px** (ya incluido en los componentes)

8. **Sigue Airbnb Style Guide** en JS/JSX

---

## 🚀 Ejemplo de Componente Completo

```jsx
import { formatPrecio, getBadgeClase, getLabelEstado } from '@/utils/formatters'

export default function LoteCard({ lote }) {
  return (
    <div className="card hover:shadow-card-hover">
      {/* Badge categoría */}
      <span className="badge-category">{lote.categoria}</span>

      {/* Título */}
      <h3 className="text-h3 text-slate-900 mt-3 mb-2">{lote.nombre}</h3>

      {/* Ubicación */}
      <p className="text-sm text-slate-600 mb-3">📍 {lote.ubicacion}</p>

      {/* Precio destacado */}
      <p className="text-md font-medium text-green-600 mb-2">
        {formatPrecio(lote.precio)}/kg
      </p>

      {/* Estado */}
      <span className={`${getBadgeClase(lote.estado)} mb-4`}>
        {getLabelEstado(lote.estado)}
      </span>

      {/* Botón */}
      <button className="btn-primary w-full mt-4">Ver lote</button>
    </div>
  )
}
```

---

## 📚 Referencias Rápidas

| Elemento | Clase Tailwind | Caso de uso |
|----------|-----------------|-------------|
| Botón CTA | `btn-primary` | "Publicar", "Comprar", "Confirmar" |
| Botón info | `btn-secondary` | "Más info", "Editar" |
| Botón en hero | `btn-ghost-white` | Fondos oscuros (#0F4C2A) |
| Badge categoría | `badge-category` | Hortalizas, Frutas, Especias |
| Badge estado | `badge-liberado`, `badge-escrow`, etc. | Estados de orden |
| Card | `card` | Tarjetas de productos, órdenes |
| H1 | `text-hero` | Hero section |
| H2 | `text-h2` | Secciones main |
| Body | `text-body text-slate-700` | Párrafos |
| Label | `text-label uppercase` | Etiquetas de formulario |

---

## 🎯 Colores Semánticos

| Estado | Fondo | Borde | Texto | Uso |
|--------|-------|-------|-------|-----|
| Éxito | `#F0FAF3` | `#91D9A8` | `#14572F` | Pago liberado, verificado |
| Advertencia | `#FFFBEB` | `#FCD34D` | `#92400E` | Escrow, pendiente |
| Error | `#FEF2F2` | `#FECACA` | `#991B1B` | QR inválido, disputa |
| Info | `#EFF6FF` | `#BFDBFE` | `#1E40AF` | En revisión, notificaciones |

---

¡El Design System es tu aliado para mantener coherencia visual en toda la app! 🌾✨
