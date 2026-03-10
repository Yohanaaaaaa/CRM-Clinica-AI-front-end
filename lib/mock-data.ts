export type PipelineStatus =
  | "novo_lead"
  | "agendado"
  | "confirmado"
  | "atendido"
  | "retorno"
  | "perdido"

export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "cancelado"
  | "realizado"
  | "falta"

export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  cpf: string
  birthDate: string
  pipelineStatus: PipelineStatus
  source: "whatsapp" | "manual" | "ai_agent"
  createdAt: string
  lastInteraction: string
  notes: string
  professional: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  professional: string
  date: string
  time: string
  duration: number
  status: AppointmentStatus
  type: string
  notes: string
  aiScheduled: boolean
}

export interface TimelineEvent {
  id: string
  patientId: string
  type: "message" | "appointment" | "status_change" | "note" | "ai_action"
  description: string
  date: string
  aiGenerated: boolean
}

export interface Metric {
  label: string
  value: number
  change: number
  suffix?: string
}

export const pipelineLabels: Record<PipelineStatus, string> = {
  novo_lead: "Novo Lead",
  agendado: "Agendado",
  confirmado: "Confirmado",
  atendido: "Atendido",
  retorno: "Retorno",
  perdido: "Perdido",
}

export const pipelineColors: Record<PipelineStatus, string> = {
  novo_lead: "bg-chart-1 text-primary-foreground",
  agendado: "bg-chart-5 text-warning-foreground",
  confirmado: "bg-success text-success-foreground",
  atendido: "bg-chart-2 text-success-foreground",
  retorno: "bg-chart-4 text-primary-foreground",
  perdido: "bg-destructive text-primary-foreground",
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  realizado: "Realizado",
  falta: "Falta",
}

export const patients: Patient[] = [
  {
    id: "p1",
    name: "Ana Clara Silva",
    phone: "(11) 98765-4321",
    email: "ana.silva@email.com",
    cpf: "123.456.789-00",
    birthDate: "1990-03-15",
    pipelineStatus: "novo_lead",
    source: "ai_agent",
    createdAt: "2026-03-01T10:30:00",
    lastInteraction: "2026-03-03T09:00:00",
    notes: "Interesse em clareamento dental",
    professional: "Dra. Marina Costa",
  },
  {
    id: "p2",
    name: "Carlos Eduardo Mendes",
    phone: "(11) 91234-5678",
    email: "carlos.mendes@email.com",
    cpf: "987.654.321-00",
    birthDate: "1985-07-22",
    pipelineStatus: "agendado",
    source: "whatsapp",
    createdAt: "2026-02-28T14:00:00",
    lastInteraction: "2026-03-02T16:30:00",
    notes: "Primeira consulta - avaliacao geral",
    professional: "Dr. Ricardo Alves",
  },
  {
    id: "p3",
    name: "Beatriz Fernandes",
    phone: "(11) 99876-5432",
    email: "bia.fernandes@email.com",
    cpf: "456.789.123-00",
    birthDate: "1992-11-08",
    pipelineStatus: "confirmado",
    source: "ai_agent",
    createdAt: "2026-02-25T09:15:00",
    lastInteraction: "2026-03-03T08:00:00",
    notes: "Retorno de tratamento ortodontico",
    professional: "Dra. Marina Costa",
  },
  {
    id: "p4",
    name: "Diego Oliveira Santos",
    phone: "(11) 93456-7890",
    email: "diego.santos@email.com",
    cpf: "321.654.987-00",
    birthDate: "1978-01-30",
    pipelineStatus: "atendido",
    source: "manual",
    createdAt: "2026-02-20T11:00:00",
    lastInteraction: "2026-03-01T15:00:00",
    notes: "Extracao do siso concluida",
    professional: "Dr. Ricardo Alves",
  },
  {
    id: "p5",
    name: "Fernanda Lima Rocha",
    phone: "(11) 94567-8901",
    email: "fernanda.rocha@email.com",
    cpf: "654.321.987-00",
    birthDate: "1995-06-12",
    pipelineStatus: "retorno",
    source: "ai_agent",
    createdAt: "2026-02-15T08:30:00",
    lastInteraction: "2026-03-02T10:00:00",
    notes: "Acompanhamento pos-implante",
    professional: "Dra. Marina Costa",
  },
  {
    id: "p6",
    name: "Gabriel Souza Martins",
    phone: "(11) 95678-9012",
    email: "gabriel.martins@email.com",
    cpf: "789.123.456-00",
    birthDate: "1988-09-25",
    pipelineStatus: "perdido",
    source: "whatsapp",
    createdAt: "2026-02-10T13:45:00",
    lastInteraction: "2026-02-20T17:00:00",
    notes: "Nao retornou apos contato inicial",
    professional: "Dr. Ricardo Alves",
  },
  {
    id: "p7",
    name: "Helena Costa Pereira",
    phone: "(11) 96789-0123",
    email: "helena.pereira@email.com",
    cpf: "147.258.369-00",
    birthDate: "2000-04-18",
    pipelineStatus: "novo_lead",
    source: "whatsapp",
    createdAt: "2026-03-03T07:00:00",
    lastInteraction: "2026-03-03T07:00:00",
    notes: "Perguntou sobre valores de limpeza",
    professional: "Dra. Marina Costa",
  },
  {
    id: "p8",
    name: "Igor Nascimento",
    phone: "(11) 97890-1234",
    email: "igor.nasc@email.com",
    cpf: "258.369.147-00",
    birthDate: "1993-12-05",
    pipelineStatus: "confirmado",
    source: "ai_agent",
    createdAt: "2026-02-27T16:20:00",
    lastInteraction: "2026-03-03T09:30:00",
    notes: "Canal no dente 36",
    professional: "Dr. Ricardo Alves",
  },
  {
    id: "p9",
    name: "Juliana Dias",
    phone: "(11) 98901-2345",
    email: "ju.dias@email.com",
    cpf: "369.147.258-00",
    birthDate: "1987-08-14",
    pipelineStatus: "agendado",
    source: "ai_agent",
    createdAt: "2026-03-01T12:00:00",
    lastInteraction: "2026-03-02T14:00:00",
    notes: "Protese parcial - avaliacao",
    professional: "Dra. Marina Costa",
  },
  {
    id: "p10",
    name: "Lucas Almeida",
    phone: "(11) 99012-3456",
    email: "lucas.almeida@email.com",
    cpf: "741.852.963-00",
    birthDate: "1996-02-28",
    pipelineStatus: "novo_lead",
    source: "ai_agent",
    createdAt: "2026-03-02T18:00:00",
    lastInteraction: "2026-03-03T08:45:00",
    notes: "Dor de dente aguda - urgencia",
    professional: "Dr. Ricardo Alves",
  },
]

export const appointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p2",
    patientName: "Carlos Eduardo Mendes",
    professional: "Dr. Ricardo Alves",
    date: "2026-03-03",
    time: "09:00",
    duration: 60,
    status: "agendado",
    type: "Avaliacao Geral",
    notes: "Primeira consulta",
    aiScheduled: false,
  },
  {
    id: "a2",
    patientId: "p3",
    patientName: "Beatriz Fernandes",
    professional: "Dra. Marina Costa",
    date: "2026-03-03",
    time: "10:00",
    duration: 30,
    status: "confirmado",
    type: "Retorno Ortodontia",
    notes: "Ajuste de aparelho",
    aiScheduled: true,
  },
  {
    id: "a3",
    patientId: "p8",
    patientName: "Igor Nascimento",
    professional: "Dr. Ricardo Alves",
    date: "2026-03-03",
    time: "11:00",
    duration: 90,
    status: "confirmado",
    type: "Tratamento de Canal",
    notes: "Dente 36 - sessao 1",
    aiScheduled: true,
  },
  {
    id: "a4",
    patientId: "p5",
    patientName: "Fernanda Lima Rocha",
    professional: "Dra. Marina Costa",
    date: "2026-03-03",
    time: "14:00",
    duration: 45,
    status: "agendado",
    type: "Acompanhamento Implante",
    notes: "Pos-operatorio 30 dias",
    aiScheduled: true,
  },
  {
    id: "a5",
    patientId: "p9",
    patientName: "Juliana Dias",
    professional: "Dra. Marina Costa",
    date: "2026-03-04",
    time: "09:00",
    duration: 60,
    status: "agendado",
    type: "Avaliacao Protese",
    notes: "Avaliacao inicial",
    aiScheduled: true,
  },
  {
    id: "a6",
    patientId: "p1",
    patientName: "Ana Clara Silva",
    professional: "Dra. Marina Costa",
    date: "2026-03-04",
    time: "11:00",
    duration: 45,
    status: "agendado",
    type: "Clareamento",
    notes: "Consulta de avaliacao",
    aiScheduled: true,
  },
  {
    id: "a7",
    patientId: "p4",
    patientName: "Diego Oliveira Santos",
    professional: "Dr. Ricardo Alves",
    date: "2026-03-02",
    time: "10:00",
    duration: 60,
    status: "realizado",
    type: "Extracao",
    notes: "Siso inferior direito",
    aiScheduled: false,
  },
  {
    id: "a8",
    patientId: "p6",
    patientName: "Gabriel Souza Martins",
    professional: "Dr. Ricardo Alves",
    date: "2026-02-28",
    time: "15:00",
    duration: 30,
    status: "falta",
    type: "Avaliacao Geral",
    notes: "Paciente nao compareceu",
    aiScheduled: false,
  },
]

export const timelineEvents: TimelineEvent[] = [
  {
    id: "t1",
    patientId: "p1",
    type: "message",
    description: "Agente IA recebeu mensagem via WhatsApp: 'Oi, gostaria de saber sobre clareamento dental'",
    date: "2026-03-01T10:30:00",
    aiGenerated: true,
  },
  {
    id: "t2",
    patientId: "p1",
    type: "ai_action",
    description: "Agente IA respondeu com informacoes sobre clareamento e sugeriu agendamento",
    date: "2026-03-01T10:31:00",
    aiGenerated: true,
  },
  {
    id: "t3",
    patientId: "p1",
    type: "status_change",
    description: "Status alterado para 'Novo Lead' pelo Agente IA",
    date: "2026-03-01T10:31:00",
    aiGenerated: true,
  },
  {
    id: "t4",
    patientId: "p1",
    type: "appointment",
    description: "Agente IA agendou consulta de avaliacao para 04/03 as 11:00 com Dra. Marina Costa",
    date: "2026-03-03T09:00:00",
    aiGenerated: true,
  },
  {
    id: "t5",
    patientId: "p3",
    type: "ai_action",
    description: "Agente IA enviou lembrete automatico de consulta via WhatsApp",
    date: "2026-03-02T18:00:00",
    aiGenerated: true,
  },
  {
    id: "t6",
    patientId: "p3",
    type: "message",
    description: "Paciente confirmou presenca via WhatsApp",
    date: "2026-03-02T18:05:00",
    aiGenerated: false,
  },
  {
    id: "t7",
    patientId: "p3",
    type: "status_change",
    description: "Status alterado de 'Agendado' para 'Confirmado' automaticamente pelo Agente IA",
    date: "2026-03-02T18:05:00",
    aiGenerated: true,
  },
  {
    id: "t8",
    patientId: "p4",
    type: "appointment",
    description: "Consulta realizada - Extracao do siso inferior direito",
    date: "2026-03-02T11:00:00",
    aiGenerated: false,
  },
  {
    id: "t9",
    patientId: "p4",
    type: "note",
    description: "Pos-operatorio: prescricao de anti-inflamatorio por 5 dias. Retorno em 7 dias.",
    date: "2026-03-02T11:30:00",
    aiGenerated: false,
  },
  {
    id: "t10",
    patientId: "p4",
    type: "ai_action",
    description: "Agente IA agendou retorno automatico para 09/03 e enviou orientacoes pos-cirurgicas via WhatsApp",
    date: "2026-03-02T12:00:00",
    aiGenerated: true,
  },
  {
    id: "t11",
    patientId: "p6",
    type: "ai_action",
    description: "Agente IA enviou 3 tentativas de contato via WhatsApp sem resposta",
    date: "2026-02-18T10:00:00",
    aiGenerated: true,
  },
  {
    id: "t12",
    patientId: "p6",
    type: "status_change",
    description: "Status alterado para 'Perdido' pelo Agente IA apos 10 dias sem resposta",
    date: "2026-02-20T17:00:00",
    aiGenerated: true,
  },
]

export const weeklyMetrics = [
  { day: "Seg", agendamentos: 12, confirmados: 10, faltas: 1 },
  { day: "Ter", agendamentos: 15, confirmados: 13, faltas: 2 },
  { day: "Qua", agendamentos: 10, confirmados: 9, faltas: 0 },
  { day: "Qui", agendamentos: 14, confirmados: 12, faltas: 1 },
  { day: "Sex", agendamentos: 16, confirmados: 14, faltas: 2 },
  { day: "Sab", agendamentos: 8, confirmados: 7, faltas: 1 },
]

export const sourceMetrics = [
  { source: "Agente IA", count: 45, percentage: 50 },
  { source: "WhatsApp Manual", count: 27, percentage: 30 },
  { source: "Recepcao", count: 18, percentage: 20 },
]

export const professionals = [
  "Dra. Marina Costa",
  "Dr. Ricardo Alves",
]
