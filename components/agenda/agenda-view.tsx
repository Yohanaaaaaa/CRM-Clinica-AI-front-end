"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  User,
} from "lucide-react"
import {
  appointmentStatusLabels,
  type Appointment as MockAppointment,
  professionals as mockProfessionals,
} from "@/lib/mock-data"
import { api, Appointment } from "@/lib/api"
import { useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { format, addDays, startOfWeek, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AppointmentForm } from "./appointment-form"
import { toast } from "sonner"
import { Plus } from "lucide-react"

const statusColors: Record<string, string> = {
  agendado: "border-l-chart-5 bg-chart-5/5",
  confirmado: "border-l-success bg-success/5",
  cancelado: "border-l-destructive bg-destructive/5",
  realizado: "border-l-chart-2 bg-chart-2/5",
  falta: "border-l-destructive bg-destructive/5",
}

const statusDotColors: Record<string, string> = {
  agendado: "bg-chart-5",
  confirmado: "bg-success",
  cancelado: "bg-destructive",
  realizado: "bg-chart-2",
  falta: "bg-destructive",
}

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
]

const weekDays = [
  { date: "2026-03-02", label: "Seg", dayNum: "02" },
  { date: "2026-03-03", label: "Ter", dayNum: "03" },
  { date: "2026-03-04", label: "Qua", dayNum: "04" },
  { date: "2026-03-05", label: "Qui", dayNum: "05" },
  { date: "2026-03-06", label: "Sex", dayNum: "06" },
  { date: "2026-03-07", label: "Sab", dayNum: "07" },
]

function AppointmentBlock({ apt }: { apt: Appointment }) {
  const patientName = apt.patient?.name || "Paciente desconhecido"
  const status = apt.status as keyof typeof appointmentStatusLabels
  return (
    <div
      className={`rounded-md border-l-[3px] p-2.5 transition-all hover:shadow-sm ${statusColors[apt.status]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {patientName}
            </span>
            {apt.aiScheduled && (
              <Bot className="size-3 text-ai" />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">{apt.type}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {apt.time} - {apt.duration}min
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`size-2 rounded-full ${statusDotColors[apt.status]}`}
          />
          <span className="text-[10px] text-muted-foreground">
            {appointmentStatusLabels[status]}
          </span>
        </div>
      </div>
    </div>
  )
}

export function AgendaView() {
  const [selectedProfessional, setSelectedProfessional] = useState("all")
  const [view, setView] = useState<"day" | "week">("day")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (selectedProfessional !== "all") params.professional = selectedProfessional
      
      if (view === "day") {
        params.date = selectedDate
      } else {
        const start = format(startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }), "yyyy-MM-dd")
        const end = format(addDays(new Date(start), 5), "yyyy-MM-dd")
        params.startDate = start
        params.endDate = end
      }

      const response = await api.getAppointments(params)
      setAppointments(response)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedProfessional, selectedDate, view])

  const handleFormSubmit = async (data: any) => {
    try {
      await api.createAppointment(data)
      toast.success("Consulta agendada com sucesso")
      setIsFormOpen(false)
      fetchAppointments()
    } catch (error) {
      toast.error("Erro ao agendar consulta")
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const dayAppointments = appointments
    .filter((a) => format(new Date(a.date), "yyyy-MM-dd") === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  const aiScheduledToday = dayAppointments.filter((a) => a.aiScheduled).length

  const handlePrevDate = () => {
    const current = new Date(selectedDate)
    setSelectedDate(format(addDays(current, view === "day" ? -1 : -7), "yyyy-MM-dd"))
  }

  const handleNextDate = () => {
    const current = new Date(selectedDate)
    setSelectedDate(format(addDays(current, view === "day" ? 1 : 7), "yyyy-MM-dd"))
  }

  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 })
  const weekDaysInterval = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 5),
  }).map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    label: format(date, "EEE", { locale: ptBR }),
    dayNum: format(date, "dd"),
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" onClick={handlePrevDate}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm font-medium">
              {view === "day" 
                ? format(new Date(selectedDate), "dd MMM yyyy", { locale: ptBR })
                : `${format(weekStart, "dd")} - ${format(addDays(weekStart, 5), "dd MMM yyyy", { locale: ptBR })}`}
            </span>
            <Button variant="outline" size="icon" className="size-8" onClick={handleNextDate}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiScheduledToday > 0 && (
            <Badge
              variant="outline"
              className="border-ai/30 bg-ai/10 text-ai text-[10px]"
            >
              <Bot className="mr-1 size-3" />
              {aiScheduledToday} agendado{aiScheduledToday > 1 ? "s" : ""} pela IA
            </Badge>
          )}
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-[200px]">
              <User className="mr-2 size-4" />
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Profissionais</SelectItem>
              {mockProfessionals.map((prof) => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Nova Consulta
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
            <DialogDescription>
              Selecione o paciente e o horário para o novo agendamento.
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            defaultDate={selectedDate}
          />
        </DialogContent>
      </Dialog>

      {/* Day View */}
      {view === "day" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4 text-primary" />
              Agenda do Dia - {format(new Date(selectedDate), "dd/MM/yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col relative min-h-[400px]">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {timeSlots.map((time) => {
                const slotAppointments = dayAppointments.filter(
                  (a) => a.time === time
                )
                return (
                  <div key={time} className="flex border-t border-border/50">
                    <div className="flex w-16 shrink-0 items-start justify-end pr-3 pt-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {time}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 py-1.5 pl-3">
                      {slotAppointments.length > 0 ? (
                        slotAppointments.map((apt) => (
                          <AppointmentBlock key={apt.id} apt={apt} />
                        ))
                      ) : (
                        <div className="h-10" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {view === "week" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-6 gap-3 relative min-h-[400px]">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {weekDaysInterval.map((day) => {
                const dayApts = appointments
                  .filter((a) => format(new Date(a.date), "yyyy-MM-dd") === day.date)
                  .sort((a, b) => a.time.localeCompare(b.time))
                const isToday = day.date === format(new Date(), "yyyy-MM-dd")
                return (
                  <div key={day.date} className="flex flex-col">
                    <div
                      className={`mb-2 flex flex-col items-center rounded-lg py-2 ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase">
                        {day.label}
                      </span>
                      <span className="text-lg font-bold">{day.dayNum}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {dayApts.map((apt) => (
                        <AppointmentBlock key={apt.id} apt={apt} />
                      ))}
                      {dayApts.length === 0 && (
                        <div className="flex items-center justify-center rounded-md border border-dashed py-6">
                          <span className="text-[10px] text-muted-foreground">
                            Livre
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Calendar Integration Notice */}
      <div className="rounded-lg border border-ai/20 bg-ai/5 p-4">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 size-5 text-ai" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              Sincronizacao com Google Calendar via Agente IA
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              O Agente de IA cria, remarca e cancela consultas automaticamente,
              sincronizando em tempo real com o Google Calendar. Conflitos de
              horario sao verificados antes de cada agendamento. Lembretes sao
              enviados 24h e 1h antes de cada consulta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
