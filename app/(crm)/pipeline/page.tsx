import { PipelineBoard } from "@/components/pipeline/pipeline-board"
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Pipeline de Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o fluxo completo do paciente, do primeiro contato ao atendimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-ai/30 bg-ai/10 text-ai"
          >
            <Bot className="mr-1 size-3" />
            Movimentacao automatica via Agente IA
          </Badge>
        </div>
      </div>

      <PipelineBoard />
    </div>
  )
}
