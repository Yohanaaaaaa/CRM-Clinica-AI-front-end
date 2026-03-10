"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bot, MessageSquare, UserPlus, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useEffect, useState } from "react"

const sourceIcons: Record<string, typeof Bot> = {
  "Agente IA": Bot,
  "WhatsApp Manual": MessageSquare,
  "Recepcao": UserPlus,
}

const sourceColors: Record<string, string> = {
  "Agente IA": "text-ai",
  "WhatsApp Manual": "text-success",
  "Recepcao": "text-chart-3",
}

export function SourceBreakdown() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSourceMetrics = async () => {
      try {
        const metrics = await api.getSourceMetrics()
        setData(metrics)
      } catch (error) {
        console.error("Failed to fetch source metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSourceMetrics()
  }, [])
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Origem dos Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 relative min-h-[150px]">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            data.map((source) => {
              const Icon = sourceIcons[source.source] || Bot
              const color = sourceColors[source.source] || "text-muted-foreground"
              return (
                <div key={source.source} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`size-4 ${color}`} />
                      <span className="text-sm font-medium text-foreground">
                        {source.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {source.count}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({source.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              )
            })
          )}
        </div>

        <div className="mt-5 rounded-lg border border-ai/20 bg-ai/5 p-3">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-ai" />
            <span className="text-xs font-semibold text-ai">
              Agente IA lidera captacao
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            50% dos leads deste mes foram captados e qualificados automaticamente
            pelo agente de inteligencia artificial via WhatsApp.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
