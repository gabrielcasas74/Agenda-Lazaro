# Lázaro — Agenda de Lecturas de Tarot

Panel de administración para gestionar citas, clientes y notas del negocio Lázaro — Lecturas de Tarot.

## Arrancar el proyecto

```bash
npm install
npm run dev
```

Abre en: http://localhost:5173

## Configuración inicial

1. **Username de Cal.com**: cuando tengas tu cuenta, editá `src/types/index.ts` y cambiá:
   ```ts
   export const CAL_USERNAME = 'tu-username-aqui';
   ```

2. **Deploy gratis en Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

## Estructura del proyecto

```
src/
├── types/          # Tipos TypeScript + catálogo de servicios
├── hooks/
│   ├── useLocalStorage.ts    # Hook base (con Math.floor en IDs)
│   └── useLazaroStore.ts     # Store central de datos
├── utils/          # Formateo de fechas, colones, signos zodiacales
└── components/
    ├── citas/
    │   ├── PantallaCitas.tsx     # Lista de próximas citas + stats
    │   └── NuevaCitaForm.tsx     # Formulario de cita manual
    ├── clientes/
    │   ├── PantallaClientes.tsx  # Lista de clientes con búsqueda
    │   └── FichaCliente.tsx      # Perfil completo + tags + notas
    └── config/
        └── PantallaConfig.tsx    # Link Cal.com + servicios
```

## Datos

Todo se guarda en `localStorage` del navegador con las claves:
- `lazaro_clientes`
- `lazaro_citas`
- `lazaro_notas`

Los datos persisten entre sesiones. Para exportar/respaldar, usar la integración de Cal.com con Google Sheets (configurar en Cal.com → Integrations → Google Sheets).

## Próximos pasos

- [ ] Conectar API de Cal.com para jalar citas automáticamente
- [ ] Exportar ficha de cliente a PDF
- [ ] Vista de calendario mensual
- [ ] Integración con el hub unificado (Fase 4 del proyecto)
