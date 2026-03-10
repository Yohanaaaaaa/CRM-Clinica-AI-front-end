"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import { useEffect, useState } from "react"
import { Loader2, Bot, MessageSquare, CalendarPlus, UserCheck, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const typeIcons: Record<string, typeof Bot> = {
  ai_action: Bot,
  message: MessageSquare,
  appointment: CalendarPlus,
  status_change: UserCheck,
  note: MessageSquare,
}

export function AiActivityFeed() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAiActivity = async () => {
      try {
        const data = await api.getAIActivity()
        setEvents(data)
      } catch (error) {
        console.error("Failed to fetch AI activity:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAiActivity()
  }, [])

  const aiEvents = events.slice(0, 8)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="size-4 text-ai" />
            Atividade do Agente IA
          </CardTitle>
          <Badge
            variant="secondary"
            className="border-ai/20 bg-ai/10 text-ai text-[10px] font-medium"
          >
            Tempo real
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[320px] px-5 pb-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : aiEvents.length > 0 ? (
              aiEvents.map((event) => {
                const Icon = typeIcons[event.type] || Bot
                return (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-ai/10">
                      <Icon className="size-3.5 text-ai" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs leading-relaxed text-foreground">
                        {event.description}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(event.createdAt), "dd MMM, HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-1 items-center justify-center py-12">
                <span className="text-sm text-muted-foreground">Nenhuma atividade recente</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
