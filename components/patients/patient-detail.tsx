"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Bot,
  CalendarPlus,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  UserCheck,
  FileText,
  Sparkles,
} from "lucide-react"
import {
  pipelineLabels,
  pipelineColors,
  appointmentStatusLabels,
  type PipelineStatus as MockPipelineStatus,
} from "@/lib/mock-data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { api, Patient, Appointment } from "@/lib/api"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const timelineIcons: Record<string, typeof Bot> = {
  ai_action: Bot,
  message: MessageSquare,
  appointment: CalendarPlus,
  status_change: UserCheck,
  note: FileText,
}

export function PatientDetail({
  patientId,
  onBack,
}: {
  patientId: string
  onBack: () => void
}) {
  const [patient, setPatient] = useState<(Patient & { appointments: Appointment[], timelineEvents: any[] }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true)
      try {
        const data = await api.getPatient(patientId)
        setPatient(data as any)
      } catch (error) {
        console.error("Failed to fetch patient:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatient()
  }, [patientId])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!patient) return null

  const patientAppointments = patient.appointments || []
  const patientEvents = [...(patient.timelineEvents || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          Detalhes do Paciente
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Info */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-base font-semibold text-foreground">
                  {patient.name}
                </h3>
                <Badge
                  className={`text-[10px] ${pipelineColors[patient.pipelineStatus as MockPipelineStatus]}`}
                >
                  {pipelineLabels[patient.pipelineStatus as MockPipelineStatus]}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                <span>CPF: {patient.cpf}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarPlus className="size-4 text-muted-foreground" />
                <span>
                  Nascimento:{" "}
                  {patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy") : "Nao informado"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Profissional
              </span>
              <span className="text-sm font-medium">{patient.professional}</span>
            </div>

            {patient.source === "ai_agent" && (
              <div className="mt-4 rounded-lg border border-ai/20 bg-ai/5 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-ai" />
                  <span className="text-xs font-semibold text-ai">
                    Captado pelo Agente IA
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Este paciente foi identificado e cadastrado automaticamente
                  pelo agente de IA via WhatsApp.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline & Appointments */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Appointments */}
          {patientAppointments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {patientAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <div className="flex flex-col items-center gap-0.5 rounded-md bg-primary/10 px-2 py-1.5">
                        <span className="text-[10px] font-medium text-primary">
                          {format(new Date(apt.date), "dd/MM")}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {apt.time}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {apt.type}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{apt.professional}</span>
                          <span className="text-border">-</span>
                          <Clock className="size-3" />
                          <span>{apt.duration}min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.aiScheduled && (
                          <Bot className="size-3.5 text-ai" />
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {appointmentStatusLabels[apt.status as keyof typeof appointmentStatusLabels]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Linha do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="relative flex flex-col gap-0 pl-6">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {patientEvents.map((event) => {
                    const Icon = timelineIcons[event.type] || MessageSquare
                    return (
                      <div key={event.id} className="relative flex gap-4 pb-5">
                        <div
                          className={`z-10 mt-0.5 flex size-6 shrink-0 -translate-x-6 items-center justify-center rounded-full border ${
                            event.aiGenerated
                              ? "border-ai/30 bg-ai/10"
                              : "border-border bg-card"
                          }`}
                        >
                          <Icon
                            className={`size-3 ${
                              event.aiGenerated
                                ? "text-ai"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 -translate-x-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(event.createdAt),
                                "dd MMM, HH:mm",
                                { locale: ptBR }
                              )}
                            </span>
                            {event.aiGenerated && (
                              <Badge
                                variant="outline"
                                className="border-ai/30 bg-ai/10 text-ai text-[9px]"
                              >
                                <Bot className="mr-0.5 size-2.5" />
                                IA
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
