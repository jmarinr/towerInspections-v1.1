// Maintenance activities by site type
export const maintenanceActivities = {
  rawland: [
    { id: 'r-1', name: 'Limpieza General del Sitio', location: 'Área general' },
    { id: 'r-2', name: 'Deshierbe y Control de Maleza', location: 'Perímetro' },
    { id: 'r-3', name: 'Limpieza de Canales y Drenajes', location: 'Sistema drenaje' },
    { id: 'r-4', name: 'Revisión de Malla Ciclónica', location: 'Perímetro' },
    { id: 'r-5', name: 'Revisión de Alambre de Púas/Concertina', location: 'Perímetro' },
    { id: 'r-6', name: 'Lubricación de Candados y Cerraduras', location: 'Accesos' },
    { id: 'r-7', name: 'Revisión de Puerta Principal', location: 'Acceso principal' },
    { id: 'r-8', name: 'Pintura de Retoques Exteriores', location: 'Estructura' },
    { id: 'r-9', name: 'Revisión de Sistema de Tierras', location: 'Sistema eléctrico' },
    { id: 'r-10', name: 'Medición de Resistividad', location: 'Sistema tierras' },
    { id: 'r-11', name: 'Revisión de Conexiones Eléctricas', location: 'Tablero eléctrico' },
    { id: 'r-12', name: 'Limpieza de Tablero Eléctrico', location: 'Nicho eléctrico' },
    { id: 'r-13', name: 'Revisión de Luces de Balizamiento', location: 'Torre' },
    { id: 'r-14', name: 'Cambio de Focos/LEDs (si aplica)', location: 'Torre' },
    { id: 'r-15', name: 'Revisión de Fotocelda', location: 'Sistema balizamiento' },
    { id: 'r-16', name: 'Apriete de Tornillería en Bridas', location: 'Torre - Bridas' },
    { id: 'r-17', name: 'Apriete de Tornillería en Celosías', location: 'Torre - Celosías' },
    { id: 'r-18', name: 'Revisión de Cable de Vida', location: 'Torre' },
    { id: 'r-19', name: 'Lubricación de Step Bolts', location: 'Torre - Escalera' },
    { id: 'r-20', name: 'Revisión de Soldaduras', location: 'Torre' },
    { id: 'r-21', name: 'Aplicación de Anticorrosivo', location: 'Zonas con oxidación' },
    { id: 'r-22', name: 'Revisión de Retenidas', location: 'Sistema retenidas' },
    { id: 'r-23', name: 'Tensado de Retenidas (si aplica)', location: 'Sistema retenidas' },
    { id: 'r-24', name: 'Revisión de Dados de Concreto', location: 'Base torre' },
    { id: 'r-25', name: 'Relleno de Nivel de Grava', location: 'Área general' },
    { id: 'r-26', name: 'Revisión de Malla Antivegetal', location: 'Piso' },
    { id: 'r-27', name: 'Limpieza de Cámaras de Inspección', location: 'Sistema tierras' },
    { id: 'r-28', name: 'Revisión de Pararrayo', location: 'Torre - Punta' },
    { id: 'r-29', name: 'Documentación Fotográfica General', location: 'Todo el sitio' },
    { id: 'r-30', name: 'Reporte de Anomalías Encontradas', location: 'Documentación' },
  ],
  rooftop: [
    { id: 't-1', name: 'Limpieza General del Área de Torre', location: 'Azotea' },
    { id: 't-2', name: 'Limpieza de Acceso a Azotea', location: 'Escaleras/Acceso' },
    { id: 't-3', name: 'Revisión de Puerta de Acceso a Azotea', location: 'Acceso azotea' },
    { id: 't-4', name: 'Lubricación de Candados', location: 'Accesos' },
    { id: 't-5', name: 'Revisión de Barandales de Seguridad', location: 'Azotea' },
    { id: 't-6', name: 'Revisión de Impermeabilización', location: 'Azotea' },
    { id: 't-7', name: 'Revisión de Sistema de Tierras', location: 'Sistema eléctrico' },
    { id: 't-8', name: 'Medición de Resistividad', location: 'Sistema tierras' },
    { id: 't-9', name: 'Revisión de Conexiones Eléctricas', location: 'Tablero' },
    { id: 't-10', name: 'Limpieza de Tablero Eléctrico', location: 'Nicho eléctrico' },
    { id: 't-11', name: 'Revisión de Luces de Balizamiento', location: 'Torre/Mástil' },
    { id: 't-12', name: 'Cambio de Focos/LEDs (si aplica)', location: 'Torre/Mástil' },
    { id: 't-13', name: 'Revisión de Fotocelda', location: 'Sistema balizamiento' },
    { id: 't-14', name: 'Apriete de Tornillería Base', location: 'Base de mástil' },
    { id: 't-15', name: 'Apriete de Tornillería Estructura', location: 'Mástil/Torre' },
    { id: 't-16', name: 'Revisión de Anclajes a Losa', location: 'Base' },
    { id: 't-17', name: 'Revisión de Soldaduras', location: 'Estructura' },
    { id: 't-18', name: 'Aplicación de Anticorrosivo', location: 'Zonas oxidadas' },
    { id: 't-19', name: 'Pintura de Retoques', location: 'Estructura' },
    { id: 't-20', name: 'Revisión de Escalera del Mástil', location: 'Mástil' },
    { id: 't-21', name: 'Revisión de Cable de Vida', location: 'Mástil' },
    { id: 't-22', name: 'Revisión de Cableado de RF', location: 'Torre/Mástil' },
    { id: 't-23', name: 'Revisión de Soportes de Antenas', location: 'Torre/Mástil' },
    { id: 't-24', name: 'Revisión de Conectores y Jumpers', location: 'Antenas' },
    { id: 't-25', name: 'Limpieza de Canaletas de Cables', location: 'Ruta de cables' },
    { id: 't-26', name: 'Revisión de Pararrayo', location: 'Punta del mástil' },
    { id: 't-27', name: 'Revisión de Bajante de Pararrayo', location: 'Sistema tierras' },
    { id: 't-28', name: 'Documentación Fotográfica General', location: 'Todo el sitio' },
    { id: 't-29', name: 'Reporte de Anomalías Encontradas', location: 'Documentación' },
  ],
}

// Helper to get activities by site type
export const getActivitiesBySiteType = (siteType) => {
  return maintenanceActivities[siteType] || maintenanceActivities.rawland
}

// Helper to get total activities count
export const getTotalActivities = (siteType) => {
  return getActivitiesBySiteType(siteType).length
}
