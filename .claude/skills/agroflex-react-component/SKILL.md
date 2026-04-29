---
name: agroflex-react-component
description: >
  Genera componentes React para el proyecto AgroFlex con el design system,
  paleta de colores y convenciones ya establecidas. Usa esta skill SIEMPRE
  que el usuario pida crear, modificar o revisar componentes React, páginas
  JSX, hooks personalizados, stores de Zustand o cualquier archivo del
  frontend de AgroFlex. También úsala cuando mencione: "componente",
  "página", "React", "JSX", "Tailwind", "hook", "store", "Zustand",
  "frontend", "UI", "pantalla", "vista", o nombres de páginas como
  "LoginPage", "CatalogPage", "ScanQRPage", etc.
---

# AgroFlex — React Component Skill

Genera componentes React para AgroFlex siguiendo el design system
oficial basado en el logo de la marca.

---

## Stack del frontend

- **Framework**: React 18 + Vite
- **Estilos**: Tailwind CSS con paleta personalizada del logo
- **Estado global**: Zustand
- **Fetching**: Axios + TanStack React Query
- **Formularios**: React Hook Form + Yup
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint Airbnb Style Guide

---

## Paleta de colores oficial (del logo AgroFlex)

```javascript
// COLORES BASE — nunca hardcodear hex en componentes, usar clases Tailwind
verde principal:  green-600  (#1E7A45)  // texto "AGRO" del logo
verde oscuro:     green-900  (#0F4C2A)  // navbar, hero, footer
verde claro:      green-100  (#C8EDD4)  // fondos, badges
lima acento:      lime-500   (#6ABF3A)  // hoja del logo, precios, verificado
gris tecnológico: slate-700  (#3A4A52)  // texto "FLEX", body text
gris oscuro:      slate-900  (#1E2A30)  // títulos h1-h3
fondo página:     slate-50   (#F4F6F7)  // background general
```

---

## Roles del sistema (para PrivateRoute y condicionales)

```javascript
const ROLES = {
  PRODUCTOR: 'PRODUCTOR',
  INVERNADERO: 'INVERNADERO',
  PROVEEDOR: 'PROVEEDOR',
  EMPAQUE: 'EMPAQUE',
  COMPRADOR: 'COMPRADOR',
  ADMIN: 'ADMIN',
};
```

---

## Reglas de código obligatorias

### Estructura de componentes
```jsx
// Patrón estándar AgroFlex — siempre así
import { useState } from 'react';
import PropTypes from 'prop-types';

const NombreComponente = ({ prop1, prop2 }) => {
  // hooks primero
  // lógica después
  // return al final
  return (
    <div className="...tailwind...">
      {/* contenido */}
    </div>
  );
};

NombreComponente.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

NombreComponente.defaultProps = {
  prop2: 0,
};

export default NombreComponente;
```

### Reglas Airbnb que SIEMPRE aplicar
- Arrow functions para todos los componentes (nunca `function`)
- Destructuring en props siempre
- Sin semicolons opcionales al final de expresiones JSX
- Imports ordenados: React → librerías → locales → estilos
- `const` para todo, `let` solo si la variable muta

### Clases Tailwind del design system (usar estas, no inventar)
```
// Botones
btn-primary      → bg-green-600 text-white rounded-lg py-3 px-5 font-medium
btn-secondary    → border border-green-600 text-green-700 rounded-lg py-3 px-5
btn-ghost-white  → border border-white/60 text-white rounded-lg py-3 px-5

// Tarjetas
card             → bg-white rounded-xl border border-slate-200 p-4 shadow-card

// Badges
badge-category   → bg-green-100 text-green-800 text-xs uppercase tracking-wide px-2 py-0.5 rounded-md
badge-verified   → bg-lime-50 text-lime-800 text-xs px-2 py-0.5 rounded-full
badge-escrow     → bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full
badge-liberado   → bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full
badge-disputa    → bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full

// Inputs
input-field      → w-full border border-slate-200 rounded-lg px-4 py-3 text-sm
field-label      → block text-sm font-medium text-slate-700 mb-1.5

// Secciones
section-wrapper  → px-page py-section
section-label    → text-label text-green-600 uppercase tracking-wide font-medium mb-1
section-title    → text-h2 text-slate-900 font-medium
```

### Tamaños mínimos táctiles (mobile-first)
- Todos los botones: mínimo `py-3` (44px de alto total)
- Inputs: mínimo `py-3`
- Áreas de toque: mínimo `min-h-[44px]`

### Estados de carga y error (obligatorio en todo fetch)
```jsx
// Siempre manejar estos 3 estados
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage mensaje={error.message} />;
return <ContenidoReal />;
```

---

## Hooks disponibles en el proyecto

```javascript
useAuth()          // user, isAuthenticated, roles, login, logout, hasRole
useGeolocation()   // coords, error, getCurrentPosition
useQRScanner()     // startScan, stopScan, result, isScanning
useDebounce()      // valor con debounce para búsquedas
usePagination()    // page, limit, totalPages, goToPage
usePWAInstall()    // puedeInstalar, instalar, yaInstalada
```

---

## Stores de Zustand disponibles

```javascript
authStore    // user, accessToken, isAuthenticated, login(), logout()
catalogStore // lotes, filtros, busqueda, setFiltros()
orderStore   // ordenes, ordenActual, crearOrden(), actualizarEstado()
```

---

## Estructura de rutas y dashboards por rol

```
/                     → LandingPage (pública)
/login                → LoginPage (pública)
/register             → RegisterPage (pública)
/catalog              → CatalogPage (pública)
/producer/dashboard   → PRODUCTOR, INVERNADERO
/buyer/dashboard      → COMPRADOR, EMPAQUE
/supplier/dashboard   → PROVEEDOR
/admin/dashboard      → ADMIN
/buyer/scan-qr        → COMPRADOR, EMPAQUE — página core del escrow
```

---

## Componentes ya existentes (no recrear)

```
common/: Badge, Button, Card, Input, Modal, Spinner, Toast
catalog/: HarvestCard, HarvestFilter, SupplyCard, MapView
orders/: OrderSummary, EscrowStatus, OrderTimeline
qr/: QRGenerator, QRScanner
layout/: Navbar, Sidebar, Footer, PrivateRoute
pages/auth/: LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
pages/shared/: LandingPage
```

---

## Pruebas unitarias obligatorias

- Cobertura mínima: **80%**
- Archivo: `NombreComponente.test.jsx` en la misma carpeta
- Usar: `@testing-library/react` + `vitest`

```jsx
// Patrón estándar AgroFlex
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NombreComponente from './NombreComponente';

describe('NombreComponente', () => {
  it('renderiza sin errores', () => { ... });
  it('muestra el contenido correcto', () => { ... });
  it('ejecuta la acción al hacer click', async () => { ... });
});
```

---

## Proceso de generación

Cuando el usuario pida un componente o página:

1. **Identificar** si ya existe en la lista de componentes disponibles
2. **Determinar** qué rol(es) pueden verlo
3. **Generar en orden**:
   - Componente principal `.jsx`
   - `index.js` de exportación
   - Test `.test.jsx`
4. **Verificar** que use solo colores del design system
5. **Recordar** que es mobile-first — estilos base para 375px

---

## Referencia adicional

Para el design system completo (variables CSS, tokens):
`src/index.css` y `src/utils/constants.js`

Para la estructura completa del frontend:
`SOArquitectura/agroflex-frontend-structure.md`
