"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  CalendarCheck,
  CheckCircle,
  UserX,
  TrendingUp,
  TrendingDown,
  Bot,
  Loader2,
} from "lucide-react"
import { api, DashboardMetrics } from "@/lib/api"
import { useEffect, useState } from "react"

const METRIC_CONFIG = [
  {
    key: "totalPatients",
    label: "Total de Pacientes",
    icon: Users,
    description: "vs. mes anterior",
    aiNote: (val: number) => `${val} captados pelo Agente IA`,
    aiValueKey: "aiConversions", // Using aiConversions as a proxy for AI-sourced patients here or similar
  },
  {
    key: "appointmentsToday",
    label: "Agendamentos Hoje",
    icon: CalendarCheck,
    description: "vs. ontem",
    aiNote: (val: number) => `${val} agendados via IA`,
    aiValueKey: "aiConversions", 
  },
  {
    key: "confirmationRate",
    label: "Taxa Confirmacao",
    icon: CheckCircle,
    description: "media atual",
    aiNote: (val: number) => `Lembretes IA ativos`,
    suffix: "%",
  },
  {
    key: "aiConversions",
    label: "Conversoes IA",
    icon: Bot,
    description: "total histórico",
    aiNote: (val: number) => `Agente operando 24/7`,
  },
]

export function MetricCards() {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await api.getDashboardMetrics()
        setData(metrics)
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-32 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRIC_CONFIG.map((config) => {
        const value = data[config.key as keyof DashboardMetrics]
        const change = data[`${config.key}Change` as keyof DashboardMetrics] || 0
        const displayValue = typeof value === 'number' 
          ? config.suffix === "%" ? value.toFixed(1) + "%" : value.toString()
          : "0"

        return (
          <Card key={config.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {config.label}
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {displayValue}
                  </span>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <config.icon className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {change >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-ai/5 px-2 py-1">
                <Bot className="size-3 text-ai" />
                <span className="text-[11px] text-ai font-medium">
                  {config.aiNote(data.aiConversions)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
