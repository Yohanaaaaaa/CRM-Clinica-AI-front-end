"use client"

// import { useState } from "react" (removed duplicate)
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Phone,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  Clock,
} from "lucide-react"
import { api, Patient } from "@/lib/api"
import { useEffect, useState, useMemo } from "react"
import { Loader2 } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const columnColors: Record<string, string> = {
  novo_lead: "border-t-chart-1",
  agendado: "border-t-chart-5",
  confirmado: "border-t-success",
  atendido: "border-t-chart-2",
  retorno: "border-t-chart-4",
  perdido: "border-t-destructive",
}

const columnDotColors: Record<string, string> = {
  novo_lead: "bg-chart-1",
  agendado: "bg-chart-5",
  confirmado: "bg-success",
  atendido: "bg-chart-2",
  retorno: "bg-chart-4",
  perdido: "bg-destructive",
}

const sourceLabels: Record<string, { label: string; icon: typeof Bot }> = {
  ai_agent: { label: "Agente IA", icon: Bot },
  whatsapp: { label: "WhatsApp", icon: MessageSquare },
  manual: { label: "Recepcao", icon: UserPlus },
}

function PatientCard({ 
  patient, 
  isOverlay = false 
}: { 
  patient: Patient; 
  isOverlay?: boolean 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: patient.id,
    data: {
      type: "Patient",
      patient,
    },
    disabled: isOverlay,
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const source = sourceLabels[patient.source]
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] rounded-lg border-2 border-dashed border-primary/20 bg-muted/50"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card className={`group cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/30 ${isOverlay ? "shadow-lg border-primary/50" : ""}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium text-foreground">
                  {patient.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-muted rounded-md"
                      onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking menu
                    >
                      <MoreHorizontal className="size-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" />
                <span>{patient.phone}</span>
              </div>
              {patient.notes && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {patient.notes}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    patient.source === "ai_agent"
                      ? "border-ai/30 bg-ai/10 text-ai"
                      : "border-border"
                  }`}
                >
                  <source.icon className="mr-1 size-3" />
                  {source.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {patient.professional ? patient.professional.split(" ").slice(-1)[0] : "Sem Prof."}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const pipelineOrder: string[] = [
  "novo_lead",
  "agendado",
  "confirmado",
  "atendido",
  "retorno",
  "perdido",
]

export function PipelineBoard() {
  const [columns, setColumns] = useState<Record<string, { patients: Patient[] }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activePatient, setActivePatient] = useState<Patient | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const fetchPipeline = async () => {
      setIsLoading(true)
      try {
        const data = await api.getPipeline()
        setColumns(data.columns)
      } catch (error) {
        console.error("Failed to fetch pipeline:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPipeline()
  }, [])

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Patient") {
      setActivePatient(event.active.data.current.patient)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const activeColumn = active.data.current?.patient.pipelineStatus
    const overColumn = over.data.current?.type === "Column" 
      ? over.id 
      : over.data.current?.patient.pipelineStatus

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    setColumns((prev) => {
      const activeItems = prev[activeColumn].patients
      const overItems = prev[overColumn].patients

      const activeIndex = activeItems.findIndex((i) => i.id === activeId)
      
      const newActiveItems = [...activeItems]
      const [item] = newActiveItems.splice(activeIndex, 1)
      item.pipelineStatus = overColumn as any

      const newOverItems = [...overItems, item]

      return {
        ...prev,
        [activeColumn]: { patients: newActiveItems },
        [overColumn]: { patients: newOverItems },
      }
    })
  }

  const onDragEnd = async (event: DragEndEvent) => {
    setActivePatient(null)
    const { active, over } = event
    if (!over) return

    const activePatient = active.data.current?.patient
    const overColumn = over.data.current?.type === "Column" 
      ? over.id 
      : over.data.current?.patient.pipelineStatus

    if (activePatient && activePatient.pipelineStatus !== overColumn) {
      try {
        await api.movePatient(activePatient.id, overColumn as string)
        toast.success("Status atualizado com sucesso")
      } catch (error) {
        toast.error("Erro ao atualizar status")
        // Revert UI if needed, but for now we trust the onDragOver optimism
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineOrder.map((status) => {
          const column = columns?.[status]
          const items = column?.patients || []
          const aiCount = items.filter((p: any) => p.source === "ai_agent").length
          return (
            <PipelineColumn
              key={status}
              status={status}
              items={items}
              aiCount={aiCount}
              isLoading={isLoading}
            />
          )
        })}
      </div>
      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activePatient ? (
          <PatientCard patient={activePatient} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function PipelineColumn({ 
  status, 
  items, 
  aiCount, 
  isLoading 
}: { 
  status: string; 
  items: Patient[]; 
  aiCount: number;
  isLoading: boolean;
}) {
  const { setNodeRef, isOver } = useSortable({
    id: status,
    data: {
      type: "Column",
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[280px] shrink-0 flex-col transition-colors ${isOver ? "bg-muted/30" : ""}`}
    >
      <div
        className={`rounded-t-lg border border-b-0 border-t-[3px] bg-card px-3 py-2.5 ${columnColors[status]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${columnDotColors[status]}`}
            />
            <span className="text-xs font-semibold text-foreground">
              {pipelineLabels[status as MockPipelineStatus]}
            </span>
            <Badge
              variant="secondary"
              className="size-5 justify-center rounded-full p-0 text-[10px]"
            >
              {items.length}
            </Badge>
          </div>
          {aiCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-ai">
              <Bot className="size-3" />
              {aiCount}
            </div>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 rounded-b-lg border border-t-0 bg-muted/20 p-2">
        <div className="flex min-h-[400px] flex-col gap-2 relative">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SortableContext
              id={status}
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((patient: Patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              {items.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-8">
                  <span className="text-xs text-muted-foreground">
                    Nenhum paciente
                  </span>
                </div>
              )}
            </SortableContext>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
