/*
 * ClientDataForm - Formulário de dados do cliente
 * Campos obrigatórios: Nome, CPF, Telefone
 * Sem campo de e-mail
 */

import { User, Phone, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientData } from "@/hooks/useIRPFCalculator";

interface ClientDataFormProps {
  data: ClientData;
  onChange: <K extends keyof ClientData>(key: K, value: ClientData[K]) => void;
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ClientDataForm({ data, onChange }: ClientDataFormProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
            Dados do Cliente
          </h2>
          <span className="text-[10px] text-gray-400 ml-auto">* Campos obrigatórios</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="nome" className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Nome Completo <span className="text-red-400">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Nome do cliente"
              value={data.nome}
              onChange={(e) => onChange("nome", e.target.value)}
              className="h-9 text-sm bg-gray-50/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf" className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              CPF <span className="text-red-400">*</span>
            </Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={data.cpf}
              onChange={(e) => onChange("cpf", formatCPF(e.target.value))}
              className="h-9 text-sm bg-gray-50/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone" className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              Telefone / WhatsApp <span className="text-red-400">*</span>
            </Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={data.telefone}
              onChange={(e) => onChange("telefone", formatPhone(e.target.value))}
              className="h-9 text-sm bg-gray-50/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
