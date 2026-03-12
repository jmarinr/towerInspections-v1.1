// Configuración Formulario: Inventario de Equipos v2
// Tabla de torre con dimensiones separadas (Alto, Ancho, Profundidad)
// 3 fotos de evidencia + sección Piso reutilizada

export const equipmentInventoryV2Steps = [
  {
    id: 'datos-generales',
    title: 'Datos',
    description: 'Información general del sitio y visita (según formato PTI).',
    icon: '🧾',
    type: 'form',
  },
  {
    id: 'inventario-torre',
    title: 'Torre',
    description: 'Inventario de equipos en torre (tabla con dimensiones desglosadas).',
    icon: '🗼',
    type: 'table-torre-v2',
  },
  {
    id: 'equipos-en-piso',
    title: 'Piso',
    description: 'Clientes y gabinetes en piso (tabla por cliente).',
    icon: '🏢',
    type: 'piso',
  },
  {
    id: 'fotos-evidencia',
    title: 'Fotos',
    description: 'Evidencia fotográfica del sitio.',
    icon: '📷',
    type: 'fotos',
  },
]

export const getEquipmentV2StepIndex = (id) => equipmentInventoryV2Steps.findIndex(s => s.id === id)
