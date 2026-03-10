"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Clock, Loader2 } from "lucide-react"
import { api, Appointment } from "@/lib/api"
import { appointmentStatusLabels } from "@/lib/mock-data"
import { useEffect, useState } from "react"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  agendado: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  confirmado: "bg-success/15 text-success border-success/30",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
  realizado: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  falta: "bg-destructive/15 text-destructive border-destructive/30",
}

export function UpcomingAppointments() {
  const [upcoming, setUpcoming] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const today = format(new Date(), "yyyy-MM-dd")
        const appointments = await api.getAppointments({ startDate: today })
        
        const sorted = appointments
          .filter((a) => a.status === "agendado" || a.status === "confirmado")
          .sort((a, b) => {
            const dateA = new Date(`${format(new Date(a.date), "yyyy-MM-dd")}T${a.time}`)
            const dateB = new Date(`${format(new Date(b.date), "yyyy-MM-dd")}T${b.time}`)
            return dateA.getTime() - dateB.getTime()
          })
          .slice(0, 6)
          
        setUpcoming(sorted)
      } catch (error) {
        console.error("Failed to fetch upcoming appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Proximas Consultas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[280px] px-5 pb-4">
          <div className="flex flex-col gap-2">
            {upcoming.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col items-center gap-0.5 rounded-md bg-primary/10 px-2 py-1.5">
                  <span className="text-[10px] font-medium text-primary">
                    {format(new Date(apt.date), "dd/MM")}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {apt.time}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {apt.patient?.name || "Paciente"}
                    </span>
                    {apt.aiScheduled && (
                      <Bot className="size-3 text-ai" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{apt.professional}</span>
                    <span className="text-border">-</span>
                    <Clock className="size-3" />
                    <span>{apt.duration}min</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${statusColors[apt.status]}`}
                >
                  {appointmentStatusLabels[apt.status]}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
