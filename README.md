# PTI Inspect v1.1

Sistema de Inspección de Torres - PWA con diseño Mobile App Native Feel

## 🚀 Características

- ✅ **PWA** - Instalable como app, funciona offline
- ✅ **Mobile-First** - Diseñado para uso en campo
- ✅ **Multi-step Forms** - Formularios por pasos (5-9 items por pantalla)
- ✅ **Auto-guardado** - No pierde datos
- ✅ **GPS** - Captura de coordenadas
- ✅ **Fotos** - Antes/Después con cámara del dispositivo
- ✅ **CI/CD** - Deploy automático a GitHub Pages

## 📱 Formularios

### Inspección de Sitio
- 12 secciones
- 76 items de evaluación
- Estados: Bueno / Regular / Malo / N/A
- Observaciones por item
- Evidencia fotográfica

### Mantenimiento Preventivo
- Rawland: 30 actividades
- Rooftop: 29 actividades
- Estados: Completado / No Aplica
- Fotos antes/después

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📦 Despliegue

### Automático (CI/CD)
1. Haz push a la rama `main`
2. GitHub Actions compila automáticamente
3. Despliega a GitHub Pages

### Configuración inicial
1. Ve a Settings → Pages
2. Source: **GitHub Actions**
3. ¡Listo!

Tu app estará en: `https://TU_USUARIO.github.io/pti-inspect/`

## 📁 Estructura

```
src/
├── components/
│   ├── ui/           # Componentes reutilizables
│   ├── layout/       # Header, Nav, etc
│   └── forms/        # Componentes de formulario
├── pages/            # Páginas principales
├── hooks/            # Custom hooks y store
├── data/             # Datos de inspección/mantenimiento
└── styles/           # CSS global
```

## 🔧 Tecnologías

- React 18
- React Router 6
- Zustand (estado global)
- Tailwind CSS
- Vite + PWA Plugin
- Lucide Icons

## 📄 Licencia

© 2024 Phoenix Tower International
