import { AgendaView } from "@/components/agenda/agenda-view"
import { Button } from "@/components/ui/button"
import { CalendarPlus } from "lucide-react"

export default function AgendaPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Agenda
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie consultas por profissional e periodo
          </p>
        </div>
        <Button size="sm">
          <CalendarPlus className="mr-1.5 size-4" />
          Nova Consulta
        </Button>
      </div>

      <AgendaView />
    </div>
  )
}
