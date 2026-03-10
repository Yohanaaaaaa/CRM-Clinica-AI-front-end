"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bot, MessageSquare, UserPlus, Search, Filter, Loader2 } from "lucide-react"
import {
  pipelineLabels,
  pipelineColors,
  type PipelineStatus as MockPipelineStatus,
} from "@/lib/mock-data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PatientDetail } from "./patient-detail"
import { api, Patient } from "@/lib/api"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { PatientForm } from "./patient-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const sourceConfig: Record<string, { label: string; icon: typeof Bot; className: string }> = {
  ai_agent: { label: "Agente IA", icon: Bot, className: "border-ai/30 bg-ai/10 text-ai" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, className: "border-success/30 bg-success/10 text-success" },
  manual: { label: "Recepcao", icon: UserPlus, className: "border-border" },
}

export function PatientTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (statusFilter !== "all") params.status = statusFilter
      if (search) params.search = search
      
      const response = await api.getPatients(params)
      setPatients(response.data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Tem certeza que deseja excluir este paciente?")) {
      try {
        await api.deletePatient(id)
        toast.success("Paciente excluído com sucesso")
        fetchPatients()
      } catch (error) {
        toast.error("Erro ao excluir paciente")
      }
    }
  }

  const handleEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPatient(patient)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingPatient) {
        await api.updatePatient(editingPatient.id, data)
        toast.success("Paciente atualizado com sucesso")
      } else {
        await api.createPatient(data)
        toast.success("Paciente criado com sucesso")
      }
      setIsFormOpen(false)
      setEditingPatient(null)
      fetchPatients()
    } catch (error) {
      toast.error("Erro ao salvar paciente")
    }
  }

  if (selectedPatient) {
    return (
      <PatientDetail
        patientId={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {(Object.keys(pipelineLabels) as PipelineStatus[]).map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {pipelineLabels[status]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setEditingPatient(null); setIsFormOpen(true); }} className="sm:ml-auto">
          <Plus className="mr-1.5 size-4" />
          Novo Paciente
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open)
        if (!open) setEditingPatient(null)
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            <DialogDescription>
              {editingPatient 
                ? "Atualize as informações do paciente." 
                : "Preencha os dados para cadastrar um novo paciente no sistema."}
            </DialogDescription>
          </DialogHeader>
          <PatientForm 
            initialData={editingPatient} 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Ultima Interacao</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => {
                const source = sourceConfig[patient.source]
                const initials = patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")

                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{patient.name}</span>
                          <span className="text-xs text-muted-foreground">{patient.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{patient.phone}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] ${pipelineColors[patient.pipelineStatus as MockPipelineStatus]}`}
                      >
                        {pipelineLabels[patient.pipelineStatus as MockPipelineStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${source.className}`}
                      >
                        <source.icon className="mr-1 size-3" />
                        {source.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.professional}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(patient.lastInteraction), "dd MMM, HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleEdit(patient, e)}>
                            <Pencil className="mr-2 size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(patient.id, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        {!isLoading && patients.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-muted-foreground">
              Nenhum paciente encontrado
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
