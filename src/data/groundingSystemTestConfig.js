import { MapPin, Calendar, ClipboardList,  Wrench, Camera, Calculator } from "lucide-react";

export const groundingSystemTestConfig = {
  id: "grounding-system-test",
  title: "Prueba de puesta a tierra",
  subtitle: "Medición de resistencia del sistema de puesta a tierra y evidencia.",
  sections: [
    {
      id: "datos",
      title: "Datos del sitio",
      description: "Identificación del sitio y datos de la visita.",
      icon: MapPin,
      fields: [
        { key: "proveedor", label: "Proveedor", type: "text", placeholder: "Ej: PTI / Contratista" },
        { key: "tipoVisita", label: "Tipo de visita", type: "select", options: ["Inspección", "Mantenimiento", "Prueba", "Otro"] },

        { key: "idSitio", label: "ID del sitio", type: "text", placeholder: "Ej: CR-SJ-001" },
        { key: "nombreSitio", label: "Nombre del sitio", type: "text", placeholder: "Ej: Torre Escazú" },
        { key: "direccion", label: "Dirección", type: "text", placeholder: "Dirección del sitio" },

        { key: "tipoSitio", label: "Tipo de sitio", type: "select", options: ["Torre", "Rooftop", "Indoor", "Otro"] },
        { key: "tipoEstructura", label: "Tipo de estructura", type: "select", options: ["Autosoportada", "Arriostrada", "Monopolo", "Otro"] },
        { key: "alturaMts", label: "Altura (mts)", type: "number", placeholder: "0" },

        { key: "latitud", label: "Latitud", type: "text", placeholder: "Ej: 9.93" },
        { key: "longitud", label: "Longitud", type: "text", placeholder: "Ej: -84.10" },

        { key: "fechaInicio", label: "Fecha inicio", type: "date" },
        { key: "fechaTermino", label: "Fecha término", type: "date" },
      ],
    },

    {
      id: "condiciones",
      title: "Condiciones del terreno",
      description: "Contexto de la medición según condiciones ambientales.",
      icon: ClipboardList,
      fields: [
        {
          key: "estadoTerreno",
          label: "Estado del terreno",
          type: "select",
          options: ["Húmedo", "Seco", "Mixto"],
          default: "Húmedo",
        },
        {
          key: "tipoTerreno",
          label: "Tipo de terreno",
          type: "select",
          options: ["Arcilloso", "Arenoso", "Rocoso", "Mixto", "Otro"],
        },
        {
          key: "ultimoDiaLluvia",
          label: "Último día de lluvia",
          type: "select",
          options: ["Hoy", "Ayer", "Hace 2 días", "Hace 3+ días", "No aplica / Desconocido"],
        },
        { key: "hora", label: "Hora de medición", type: "text", placeholder: "Ej: 14:30" },
        {
          key: "notaMetodo",
          label: "Nota (método)",
          type: "textarea",
          placeholder:
            "Si el sitio es un rooftop y no se pueden colocar picas/estacas, describa el método alterno de medición y ubicación del electrodo.",
        },
      ],
    },

    {
      id: "equipo",
      title: "Equipo de medición",
      description: "Datos del equipo utilizado (según disponibilidad).",
      icon: Wrench,
      fields: [
        { key: "equipoMarca", label: "Marca", type: "text", placeholder: "Ej: Fluke" },
        { key: "equipoModelo", label: "Modelo", type: "text", placeholder: "Ej: 1625-2" },
        { key: "equipoSerial", label: "Serial", type: "text", placeholder: "Número de serie" },
        { key: "equipoCalibracion", label: "Fecha de calibración", type: "date" },
      ],
    },

    {
      id: "medicion",
      title: "Medición de resistencia",
      description: "Registre los valores medidos (Ohms) por punto.",
      icon: Calculator,
      fields: [
        { key: "distanciaElectrodoCorriente", label: "Distancia elect. corriente (mts)", type: "number", placeholder: "0" },

        { key: "rPataTorre", label: "Pata de la torre (Ohms)", type: "number", placeholder: "0" },
        { key: "rCerramiento", label: "Cerramiento (Ohms)", type: "number", placeholder: "0" },
        { key: "rPorton", label: "Portón (Ohms)", type: "number", placeholder: "0" },
        { key: "rPararrayos", label: "Pararrayos (Ohms)", type: "number", placeholder: "0" },
        { key: "rBarraSPT", label: "Barra SPT (Ohms)", type: "number", placeholder: "0" },
        { key: "rEscalerilla1", label: "Escalerilla (Ohms) #1", type: "number", placeholder: "0" },
        { key: "rEscalerilla2", label: "Escalerilla (Ohms) #2", type: "number", placeholder: "0" },

        { key: "sumResistencias", label: "Sumatoria (automática)", type: "calculated" },
        { key: "rg", label: "Rg (promedio automático)", type: "calculated" },

        { key: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Notas relevantes de la medición." },
      ],
    },

    {
      id: "evidencia",
      title: "Evidencia fotográfica",
      description: "Tome fotos por punto (opcional).",
      icon: Camera,
      fields: [
        { key: "fotoPataTorre", label: "Foto - Pata de la torre", type: "photo" },
        { key: "fotoCerramiento", label: "Foto - Cerramiento", type: "photo" },
        { key: "fotoPorton", label: "Foto - Portón", type: "photo" },
        { key: "fotoPararrayos", label: "Foto - Pararrayos", type: "photo" },
        { key: "fotoBarraSPT", label: "Foto - Barra SPT", type: "photo" },
        { key: "fotoEscalerilla1", label: "Foto - Escalerilla #1", type: "photo" },
        { key: "fotoEscalerilla2", label: "Foto - Escalerilla #2", type: "photo" },
      ],
    },
  ],
};
