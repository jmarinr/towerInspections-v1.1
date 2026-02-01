import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import AutosaveIndicator from "../components/ui/AutosaveIndicator";
import DynamicForm from "../components/forms/DynamicForm";
import { groundingSystemTestConfig } from "../data/groundingSystemTestConfig";
import { useAppStore } from "../hooks/useAppStore";

export default function GroundingSystemTest() {
  const navigate = useNavigate();
  const { sectionId } = useParams();

  const groundingData = useAppStore((s) => s.groundingSystemData);
  const setGroundingField = useAppStore((s) => s.setGroundingField);
  const lastSavedAt = useAppStore((s) => s.lastSavedAt);

  const sections = groundingSystemTestConfig.sections;

  const currentSection = useMemo(
    () => sections.find((s) => s.id === sectionId),
    [sectionId, sections]
  );

  const openSection = (id) => navigate(`/grounding-system-test/${id}`);

  const handleChange = (secId, fieldId, value) => {
    setGroundingField(secId, fieldId, value);

    // Cálculos automáticos para la sección de medición
    if (secId === "medicion") {
      const next = { ...(groundingData?.medicion || {}) };
      next[fieldId] = value;

      const keys = [
        "rPataTorre",
        "rCerramiento",
        "rPorton",
        "rPararrayos",
        "rBarraSPT",
        "rEscalerilla1",
        "rEscalerilla2",
      ];

      const vals = keys
        .map((k) => Number(next[k] ?? 0))
        .filter((v) => !Number.isNaN(v));

      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;

      // Guardar calculados (sin exigir campos adicionales)
      setGroundingField("medicion", "sumResistencias", sum.toFixed(2));
      setGroundingField("medicion", "rg", avg.toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title={groundingSystemTestConfig.title}
        showBack={!!sectionId}
        onBack={() => navigate("/grounding-system-test")}
      />

      <div className="max-w-5xl mx-auto px-4 pb-28 pt-4">
        <AutosaveIndicator lastSavedAt={lastSavedAt} />

        {!sectionId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((s) => (
              <button
                key={s.id}
                className="text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition"
                onClick={() => openSection(s.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                    <div className="text-xs text-gray-500 mt-2">{(s.fields || []).length} ítems</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sectionId && currentSection && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-extrabold text-gray-900">{currentSection.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{currentSection.description}</div>
              </div>

              <div className="p-4">
                <DynamicForm
                  fields={currentSection.fields || []}
                  data={groundingData?.[sectionId] || {}}
                  onChange={(fieldId, value) => handleChange(sectionId, fieldId, value)}
                />
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white font-semibold shadow-sm active:scale-[0.99]"
                  onClick={() => navigate("/grounding-system-test")}
                >
                  Guardar y volver al menú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
