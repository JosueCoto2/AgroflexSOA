# AgroFlex — Frontend Structure (React PWA + Tailwind CSS)

agroflex-frontend/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker (offline support)
│   ├── icons/                     # App icons (192, 512px)
│   └── index.html
│
├── src/
│   ├── api/                       # Axios instances & interceptors
│   │   ├── axiosClient.js         # Base client con JWT interceptor
│   │   ├── authApi.js
│   │   ├── catalogApi.js
│   │   ├── ordersApi.js
│   │   ├── paymentsApi.js
│   │   ├── qrApi.js
│   │   └── usersApi.js
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── components/                # Átomos y moléculas reutilizables
│   │   ├── common/
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Badge.test.jsx
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.test.jsx
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   └── Toast/
│   │   │
│   │   ├── catalog/
│   │   │   ├── HarvestCard/
│   │   │   │   ├── HarvestCard.jsx
│   │   │   │   └── HarvestCard.test.jsx
│   │   │   ├── HarvestFilter/
│   │   │   ├── SupplyCard/
│   │   │   └── MapView/           # Integración geolocalización
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderSummary/
│   │   │   ├── EscrowStatus/
│   │   │   └── OrderTimeline/
│   │   │
│   │   ├── qr/
│   │   │   ├── QRGenerator/
│   │   │   │   ├── QRGenerator.jsx
│   │   │   │   └── QRGenerator.test.jsx
│   │   │   └── QRScanner/
│   │   │       ├── QRScanner.jsx
│   │   │       └── QRScanner.test.jsx
│   │   │
│   │   └── layout/
│   │       ├── Navbar/
│   │       ├── Sidebar/
│   │       ├── Footer/
│   │       └── PrivateRoute/      # RBAC route wrapper
│   │
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useGeolocation.js
│   │   ├── useQRScanner.js
│   │   ├── useDebounce.js
│   │   └── usePagination.js
│   │
│   ├── pages/                     # Vistas por rol
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── VerifyBadgePage.jsx
│   │   │
│   │   ├── catalog/
│   │   │   ├── CatalogPage.jsx    # Vista pública de lotes
│   │   │   ├── HarvestDetailPage.jsx
│   │   │   └── SupplyStorePage.jsx
│   │   │
│   │   ├── producer/              # Rol: Productor / Invernadero
│   │   │   ├── DashboardProducer.jsx
│   │   │   ├── PublishHarvestPage.jsx
│   │   │   └── MyHarvestsPage.jsx
│   │   │
│   │   ├── buyer/                 # Rol: Comprador / Empaque
│   │   │   ├── DashboardBuyer.jsx
│   │   │   ├── MyOrdersPage.jsx
│   │   │   └── ScanQRPage.jsx     # Flujo de validación en entrega
│   │   │
│   │   ├── supplier/              # Rol: Proveedor agroinsumos
│   │   │   ├── DashboardSupplier.jsx
│   │   │   └── ManageStorePage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── UsersManagementPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   │
│   │   └── shared/
│   │       ├── ProfilePage.jsx
│   │       ├── ReputationPage.jsx
│   │       └── NotFoundPage.jsx
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx          # React Router v6
│   │   └── routeConfig.js         # Definición de rutas + roles permitidos
│   │
│   ├── services/                  # Lógica de negocio frontend
│   │   ├── firebase.js            # Firebase config + helpers
│   │   ├── stripeService.js
│   │   └── geolocationService.js
│   │
│   ├── store/                     # Zustand (state management)
│   │   ├── authStore.js
│   │   ├── catalogStore.js
│   │   └── orderStore.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js          # Fechas, moneda, unidades
│   │   ├── validators.js          # Yup schemas
│   │   └── geoUtils.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Tailwind directives
│
├── tests/
│   ├── setup.js                   # Vitest / Jest config
│   └── mocks/
│       ├── apiMocks.js
│       └── firebaseMocks.js
│
├── .eslintrc.js                   # Airbnb style guide
├── .prettierrc
├── tailwind.config.js
├── vite.config.js
├── vitest.config.js
└── package.json
