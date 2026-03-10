import { MetricCards } from "@/components/dashboard/metric-cards"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { AiActivityFeed } from "@/components/dashboard/ai-activity-feed"
import { SourceBreakdown } from "@/components/dashboard/source-breakdown"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { Bot, Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* AI Integration Banner */}
      <div className="relative overflow-hidden rounded-xl border border-ai/20 bg-ai/5 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-ai text-ai-foreground">
              <Bot className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Agente de IA Integrado
              </h2>
              <p className="text-xs text-muted-foreground">
                Atendimento WhatsApp, agendamento e follow-up automatizados 24h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center rounded-lg bg-card px-3 py-1.5">
              <span className="text-lg font-bold text-ai">52</span>
              <span className="text-[10px] text-muted-foreground">Agendamentos IA</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-card px-3 py-1.5">
              <span className="text-lg font-bold text-success">89%</span>
              <span className="text-[10px] text-muted-foreground">Confirmacao</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-card px-3 py-1.5">
              <span className="text-lg font-bold text-foreground">24/7</span>
              <span className="text-[10px] text-muted-foreground">Disponivel</span>
            </div>
          </div>
        </div>
        <Sparkles className="absolute -right-2 -top-2 size-20 text-ai/10" />
      </div>

      {/* Metric Cards */}
      <MetricCards />

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <SourceBreakdown />
      </div>

      {/* Appointments & AI Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingAppointments />
        <AiActivityFeed />
      </div>
    </div>
  )
}
