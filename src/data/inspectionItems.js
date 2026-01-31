// Inspection data organized by sections
export const inspectionSections = [
  {
    id: 'info',
    title: 'Info General',
    icon: '📋',
    description: 'Datos básicos del sitio',
    type: 'form',
  },
  {
    id: 'acceso',
    title: 'Acceso',
    icon: '🚪',
    description: 'Condiciones de acceso y limpieza',
    items: [
      { id: 'acc-1', text: '¿Cuál es la condición del camino de acceso al sitio?' },
      { id: 'acc-2', text: '¿Cómo está la limpieza exterior del sitio?' },
      { id: 'acc-3', text: '¿El candado y sistema de acceso principal funcionan correctamente?', hasPhoto: true },
      { id: 'acc-4', text: '¿Las escaleras de acceso al inmueble y azotea están en buen estado?' },
      { id: 'acc-5', text: '¿Cómo califica la limpieza general del interior del sitio?' },
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: '🔒',
    description: 'Seguridad perimetral del sitio',
    items: [
      { id: 'seg-1', text: '¿Cuál es la condición de la malla ciclónica perimetral?', hasPhoto: true },
      { id: 'seg-2', text: '¿Cómo está la cimentación de la malla ciclónica?' },
      { id: 'seg-3', text: '¿Cuál es la condición de los muros perimetrales?' },
      { id: 'seg-4', text: '¿El alambre de púas y/o concertina está en buen estado?' },
      { id: 'seg-5', text: '¿La puerta del sitio cuenta con candado y/o llave funcional?' },
      { id: 'seg-6', text: '¿Cuál es la condición de la puerta principal de acceso?' },
      { id: 'seg-7', text: '¿Las cámaras o sistema de monitoreo funcionan correctamente?' },
    ],
  },
  {
    id: 'tierras',
    title: 'Tierras',
    icon: '⚡',
    description: 'Sistema de puesta a tierra',
    items: [
      { id: 'tie-1', text: '¿Cuál es la condición del cable de tierra?' },
      { id: 'tie-2', text: '¿Cómo están las soldaduras del sistema de tierras?' },
      { id: 'tie-3', text: '¿Se realizó prueba de resistividad? ¿Resultado?' },
      { id: 'tie-4', text: '¿Cuál es la condición de los registros/cámaras de inspección?' },
      { id: 'tie-5', text: '¿Las conexiones para aterrizar la torre están bien?' },
      { id: 'tie-6', text: '¿Las conexiones para aterrizar malla y/o muros están bien?' },
    ],
  },
  {
    id: 'electrico',
    title: 'Eléctrico',
    icon: '🔌',
    description: 'Sistema eléctrico del sitio',
    items: [
      { id: 'ele-1', text: '¿Cuál es el estado del nicho eléctrico?' },
      { id: 'ele-2', text: '¿El candado de seguridad y protección está funcional?' },
      { id: 'ele-3', text: '¿Cuál es la condición de los registros eléctricos?' },
      { id: 'ele-4', text: '¿Cuál es la condición de los postes eléctricos?' },
      { id: 'ele-5', text: '¿Cómo está el transformador o subestación?' },
      { id: 'ele-6', text: '¿Las tierras del sistema eléctrico están bien?' },
    ],
  },
  {
    id: 'sitio',
    title: 'Sitio',
    icon: '🏗️',
    description: 'Condiciones generales del sitio',
    items: [
      { id: 'sit-1', text: '¿Cuál es la condición y nivel de la grava?' },
      { id: 'sit-2', text: '¿La malla antivegetal (antipasto) está en buen estado?' },
      { id: 'sit-3', text: '¿Cuál es la condición de la protección del nicho?' },
      { id: 'sit-4', text: '¿El drenaje del sitio está libre y funcionando?' },
      { id: 'sit-5', text: '¿Cómo está la pintura exterior e interior del sitio?' },
      { id: 'sit-6', text: '¿Hay grietas o asentamiento en la base de la torre?' },
      { id: 'sit-7', text: '¿Hay grietas o asentamiento en los dados?' },
      { id: 'sit-8', text: '¿Hay grietas o asentamiento en la base de equipos?' },
    ],
  },
  {
    id: 'torre-miembros',
    title: 'Torre',
    icon: '📡',
    description: 'Estructura y miembros de la torre',
    items: [
      { id: 'tor-1', text: '¿Hay miembros de la torre dañados?' },
      { id: 'tor-2', text: '¿Hay miembros flojos en la estructura?' },
      { id: 'tor-3', text: '¿Hay miembros faltantes en la torre?' },
      { id: 'tor-4', text: '¿Cuál es la condición de la escalera de ascenso?' },
      { id: 'tor-5', text: '¿Los tornillos en bridas están completos?' },
      { id: 'tor-6', text: '¿Los tornillos en bridas van de abajo hacia arriba?' },
      { id: 'tor-7', text: '¿Los tornillos en celosías están completos?' },
      { id: 'tor-8', text: '¿Cuál es la condición de soldadura entre pierna y brida?' },
      { id: 'tor-9', text: '¿Cuál es la condición del cable de vida?' },
      { id: 'tor-10', text: '¿Cómo están los step bolt y equipo de seguridad?' },
      { id: 'tor-11', text: '¿El dren de las piernas de la torre está libre?' },
      { id: 'tor-12', text: '¿El grout está presente y en buen estado?' },
      { id: 'tor-13', text: '¿Cuál es el estado del camuflaje (si aplica)?' },
      { id: 'tor-14', text: '¿La torre está vertical? ¿Se observa inclinación?' },
    ],
  },
  {
    id: 'torre-acabado',
    title: 'Acabado',
    icon: '🎨',
    description: 'Acabado y protección de la torre',
    items: [
      { id: 'aca-1', text: '¿Cuál es la condición de la pintura de la torre?' },
      { id: 'aca-2', text: '¿Cuál es la condición del galvanizado?' },
      { id: 'aca-3', text: '¿Hay presencia de oxidación en la estructura?' },
    ],
  },
  {
    id: 'torre-luces',
    title: 'Luces',
    icon: '💡',
    description: 'Sistema de balizamiento',
    items: [
      { id: 'luz-1', text: '¿Qué tipo de sistema de balizamiento tiene instalado?' },
      { id: 'luz-2', text: '¿El sistema de luz funciona correctamente?' },
      { id: 'luz-3', text: '¿Cuál es la condición de tubería, cajas y sujetadores?' },
      { id: 'luz-4', text: '¿Cuál es la condición del cable del sistema?' },
      { id: 'luz-5', text: '¿Cuál es la condición de la fotocelda?' },
      { id: 'luz-6', text: '¿Cuál es la condición del controlador?' },
      { id: 'luz-7', text: '¿Cuál es la condición general de las luces?' },
    ],
  },
  {
    id: 'torre-tierras',
    title: 'Tierras Torre',
    icon: '🔗',
    description: 'Sistema de tierras en torre',
    items: [
      { id: 'tt-1', text: '¿Cuál es la condición de tapas y registros?' },
      { id: 'tt-2', text: '¿Cómo están las conexiones exotérmicas?' },
      { id: 'tt-3', text: '¿Cuál es la condición del cable de tierras?' },
      { id: 'tt-4', text: '¿Cómo está la sujeción, condición y tipo de cable?' },
      { id: 'tt-5', text: '¿El aterrizaje de las piernas de la torre está bien?' },
      { id: 'tt-6', text: '¿El aterrizaje de las retenidas está bien?' },
      { id: 'tt-7', text: '¿El aterrizaje de la malla ciclónica está bien?' },
      { id: 'tt-8', text: '¿El aterrizaje del mástil/monopolo está bien?' },
      { id: 'tt-9', text: '¿El aterrizaje de la portacablera está bien?' },
      { id: 'tt-10', text: '¿Hay oxidación en el sistema de tierras?' },
      { id: 'tt-11', text: '¿Cuál es la condición del pararrayo y cable?' },
      { id: 'tt-12', text: '¿Cómo califica el sistema de tierra en general?' },
    ],
  },
  {
    id: 'retenidas',
    title: 'Retenidas',
    icon: '🔩',
    description: 'Sistema de retenidas (si aplica)',
    items: [
      { id: 'ret-1', text: '¿Cuál es la condición de los dados de concreto?' },
      { id: 'ret-2', text: '¿Cuál es la condición de las anclas?' },
      { id: 'ret-3', text: '¿Cómo están las uniones entre retenidas y anclas?' },
      { id: 'ret-4', text: '¿Las retenidas están libres de oxidación?' },
      { id: 'ret-5', text: '¿Cómo se ve la tensión de las retenidas (visual)?' },
      { id: 'ret-6', text: '¿Cuál es la condición de tornillos y sujetadores?' },
    ],
  },
  {
    id: 'cimentacion',
    title: 'Cimentación',
    icon: '🧱',
    description: 'Cimentación de la torre',
    items: [
      { id: 'cim-1', text: '¿Hay erosión visible en la cimentación?' },
      { id: 'cim-2', text: '¿Cuál es la condición del acabado en dados?' },
    ],
  },
]

// Helper to get total items count
export const getTotalInspectionItems = () => {
  return inspectionSections
    .filter(s => s.items)
    .reduce((acc, section) => acc + section.items.length, 0)
}

// Helper to get section by ID
export const getSectionById = (id) => {
  return inspectionSections.find(s => s.id === id)
}

// Get sections for navigation (excluding info form)
export const getInspectionSteps = () => {
  return inspectionSections.map((section, index) => ({
    ...section,
    stepNumber: index + 1,
    itemCount: section.items?.length || 0,
  }))
}
