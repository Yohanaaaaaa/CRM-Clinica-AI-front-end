import { PatientTable } from "@/components/patients/patient-table"
import { Button } from "@/components/ui/button"

export default function PacientesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Central de cadastro e historico completo de interacoes
          </p>
        </div>
      </div>

      <PatientTable />
    </div>
  )
}
