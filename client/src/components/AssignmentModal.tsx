import React, { useState } from 'react';
import { RegulatoryOpportunity, OpportunityStatus, SpiTeamMember } from '../types';
import { X, UserCheck, Send, Check } from 'lucide-react';

interface AssignmentModalProps {
  opportunity: RegulatoryOpportunity | null;
  teamMembers: SpiTeamMember[];
  onClose: () => void;
  onSave: (
    opportunityId: string,
    member: SpiTeamMember | null,
    status: OpportunityStatus,
    note?: string
  ) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  opportunity,
  teamMembers,
  onClose,
  onSave
}) => {
  if (!opportunity) return null;

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    opportunity.assignedTo?.id || ''
  );
  const [status, setStatus] = useState<OpportunityStatus>(opportunity.status);
  const [note, setNote] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const member = teamMembers.find((m) => m.id === selectedMemberId) || null;
    onSave(opportunity.id, member, status, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Gestión & Asignación de Oportunidad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <p className="font-semibold text-slate-500 mb-1">Normativa / Hallazgo:</p>
            <p className="text-slate-900 font-bold line-clamp-2">{opportunity.title}</p>
          </div>

          {/* Seleccionar Responsable */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Consultor Responsable en SPI:
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                if (e.target.value && status === 'nueva') {
                  setStatus('asignada');
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="">-- Sin Asignar --</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
            </select>
          </div>

          {/* Estado del Trámite / Oportunidad */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Estado de la Oportunidad:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="nueva">🟢 Nueva</option>
              <option value="en_evaluacion">🟡 En Evaluación Técnica</option>
              <option value="asignada">🔵 Asignada a Consultor</option>
              <option value="contactando_clientes">🟣 Contactando Clientes / Ofertando</option>
              <option value="cerrada">⚪ Cerrada / Completada</option>
            </select>
          </div>

          {/* Nueva Nota de Bitácora */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Agregar Nota o Actualización de Gestión:
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Se coordinó con Laura para preparar cotizaciones a 5 laboratorios con registros por vencer..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
