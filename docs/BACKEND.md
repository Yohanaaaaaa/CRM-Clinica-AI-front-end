# ClinicAI - Documentacao do Backend

## Visao Geral

O **ClinicAI** e um CRM inteligente para clinicas medicas e odontologicas que integra um **Agente de IA** para automacao de atendimento via WhatsApp, agendamentos automaticos e gestao de pipeline de pacientes.

Este documento descreve a arquitetura do backend, modelos de dados, endpoints da API e integracao com o agente de IA.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Next.js App Router)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                 │
│                   /api/v1/*                                     │
├─────────────────────────────────────────────────────────────────┤
│  /patients    /appointments    /pipeline    /metrics    /ai     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌───────────────────┐
│    DATABASE     │ │  AGENTE   │ │     WHATSAPP      │
│   (Supabase/    │ │    IA     │ │       API         │
│     Neon)       │ │           │ │   (Evolution/     │
│                 │ │           │ │    Baileys)       │
└─────────────────┘ └───────────┘ └───────────────────┘
```

---

## Modelos de Dados

### Patient (Paciente)

```typescript
interface Patient {
  id: string                    // UUID unico
  name: string                  // Nome completo
  phone: string                 // Telefone com DDD
  email: string                 // Email
  cpf: string                   // CPF (formatado)
  birthDate: string             // Data de nascimento (ISO 8601)
  pipelineStatus: PipelineStatus // Status no funil
  source: PatientSource         // Origem do lead
  createdAt: string             // Data de criacao (ISO 8601)
  lastInteraction: string       // Ultima interacao (ISO 8601)
  notes: string                 // Observacoes
  professional: string          // Profissional responsavel
}

type PipelineStatus = 
  | "novo_lead"     // Lead recem-captado
  | "agendado"      // Consulta agendada
  | "confirmado"    // Consulta confirmada
  | "atendido"      // Consulta realizada
  | "retorno"       // Aguardando retorno
  | "perdido"       // Lead perdido

type PatientSource = 
  | "ai_agent"      // Captado pelo Agente IA
  | "whatsapp"      // Contato manual via WhatsApp
  | "manual"        // Cadastro manual na recepcao
```

### Appointment (Agendamento)

```typescript
interface Appointment {
  id: string                      // UUID unico
  patientId: string               // FK para Patient
  patientName: string             // Nome do paciente (desnormalizado)
  professional: string            // Profissional responsavel
  date: string                    // Data (YYYY-MM-DD)
  time: string                    // Hora (HH:mm)
  duration: number                // Duracao em minutos
  status: AppointmentStatus       // Status do agendamento
  type: string                    // Tipo de procedimento
  notes: string                   // Observacoes
  aiScheduled: boolean            // Se foi agendado pela IA
}

type AppointmentStatus = 
  | "agendado"      // Agendado, aguardando confirmacao
  | "confirmado"    // Confirmado pelo paciente
  | "cancelado"     // Cancelado
  | "realizado"     // Consulta concluida
  | "falta"         // Paciente nao compareceu
```

### TimelineEvent (Evento da Linha do Tempo)

```typescript
interface TimelineEvent {
  id: string                      // UUID unico
  patientId: string               // FK para Patient
  type: TimelineEventType         // Tipo do evento
  description: string             // Descricao do evento
  date: string                    // Data/hora (ISO 8601)
  aiGenerated: boolean            // Se foi gerado pela IA
}

type TimelineEventType = 
  | "message"         // Mensagem recebida/enviada
  | "appointment"     // Agendamento criado/modificado
  | "status_change"   // Mudanca de status no pipeline
  | "note"            // Nota adicionada
  | "ai_action"       // Acao automatica da IA
```

---

## Schema do Banco de Dados (SQL)

```sql
-- Enum types
CREATE TYPE pipeline_status AS ENUM (
  'novo_lead', 'agendado', 'confirmado', 
  'atendido', 'retorno', 'perdido'
);

CREATE TYPE patient_source AS ENUM (
  'ai_agent', 'whatsapp', 'manual'
);

CREATE TYPE appointment_status AS ENUM (
  'agendado', 'confirmado', 'cancelado', 
  'realizado', 'falta'
);

CREATE TYPE timeline_event_type AS ENUM (
  'message', 'appointment', 'status_change', 
  'note', 'ai_action'
);

-- Tabela de Pacientes
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  pipeline_status pipeline_status DEFAULT 'novo_lead',
  source patient_source DEFAULT 'manual',
  professional VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 30,
  status appointment_status DEFAULT 'agendado',
  type VARCHAR(255),
  notes TEXT,
  ai_scheduled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Eventos da Timeline
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type timeline_event_type NOT NULL,
  description TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Profissionais
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX idx_patients_pipeline ON patients(pipeline_status);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_timeline_patient ON timeline_events(patient_id);
CREATE INDEX idx_timeline_date ON timeline_events(created_at);
```

---

## API Endpoints

### Pacientes

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/patients` | Lista todos os pacientes |
| GET | `/api/v1/patients/:id` | Busca paciente por ID |
| POST | `/api/v1/patients` | Cria novo paciente |
| PATCH | `/api/v1/patients/:id` | Atualiza paciente |
| DELETE | `/api/v1/patients/:id` | Remove paciente |
| GET | `/api/v1/patients/:id/timeline` | Timeline do paciente |
| PATCH | `/api/v1/patients/:id/pipeline` | Atualiza status no pipeline |

#### GET /api/v1/patients

Query Parameters:
- `status` - Filtra por status do pipeline
- `source` - Filtra por origem
- `professional` - Filtra por profissional
- `search` - Busca por nome, telefone ou email
- `page` - Pagina (default: 1)
- `limit` - Itens por pagina (default: 20)

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ana Clara Silva",
      "phone": "(11) 98765-4321",
      "pipelineStatus": "novo_lead",
      "source": "ai_agent",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST /api/v1/patients

Request Body:
```json
{
  "name": "Nome do Paciente",
  "phone": "(11) 99999-9999",
  "email": "email@exemplo.com",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "professional": "Dra. Marina Costa",
  "notes": "Observacoes...",
  "source": "ai_agent"
}
```

### Agendamentos

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/appointments` | Lista agendamentos |
| GET | `/api/v1/appointments/:id` | Busca agendamento por ID |
| POST | `/api/v1/appointments` | Cria agendamento |
| PATCH | `/api/v1/appointments/:id` | Atualiza agendamento |
| DELETE | `/api/v1/appointments/:id` | Cancela agendamento |
| POST | `/api/v1/appointments/:id/confirm` | Confirma agendamento |
| POST | `/api/v1/appointments/:id/complete` | Marca como realizado |

#### GET /api/v1/appointments

Query Parameters:
- `date` - Filtra por data especifica (YYYY-MM-DD)
- `startDate` - Data inicial do periodo
- `endDate` - Data final do periodo
- `professional` - Filtra por profissional
- `status` - Filtra por status
- `patientId` - Filtra por paciente

#### POST /api/v1/appointments

Request Body:
```json
{
  "patientId": "uuid-do-paciente",
  "professional": "Dr. Ricardo Alves",
  "date": "2026-03-10",
  "time": "09:00",
  "duration": 60,
  "type": "Avaliacao Geral",
  "notes": "Primeira consulta",
  "aiScheduled": true
}
```

### Pipeline

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pipeline` | Dados do Kanban por status |
| GET | `/api/v1/pipeline/stats` | Estatisticas do pipeline |
| PATCH | `/api/v1/pipeline/move` | Move paciente entre colunas |

#### GET /api/v1/pipeline

Response:
```json
{
  "columns": {
    "novo_lead": {
      "label": "Novo Lead",
      "count": 15,
      "patients": [...]
    },
    "agendado": {
      "label": "Agendado",
      "count": 23,
      "patients": [...]
    }
    // ... demais colunas
  }
}
```

### Metricas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/metrics/dashboard` | Metricas do dashboard |
| GET | `/api/v1/metrics/weekly` | Metricas semanais |
| GET | `/api/v1/metrics/sources` | Metricas por origem |
| GET | `/api/v1/metrics/conversion` | Taxa de conversao |

#### GET /api/v1/metrics/dashboard

Response:
```json
{
  "totalPatients": 156,
  "totalPatientsChange": 12.5,
  "appointmentsToday": 8,
  "appointmentsTodayChange": 25.0,
  "confirmationRate": 85.0,
  "confirmationRateChange": 5.2,
  "aiConversions": 45,
  "aiConversionsChange": 32.0
}
```

---

## Integracao com Agente de IA

### Arquitetura da Integracao

O Agente de IA atua como um middleware entre o WhatsApp e o CRM, processando mensagens, tomando decisoes e executando acoes automatizadas.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  WhatsApp   │────▶│   Agente    │────▶│   CRM API   │
│  Business   │◀────│     IA      │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   AI/LLM    │
                    │  (OpenAI/   │
                    │  Anthropic) │
                    └─────────────┘
```

### Webhook do Agente IA

#### POST /api/v1/ai/webhook

Endpoint para receber eventos do Agente de IA.

Headers:
```
Authorization: Bearer {AI_AGENT_SECRET}
Content-Type: application/json
```

Request Body:
```json
{
  "event": "message_received" | "action_executed" | "status_change",
  "timestamp": "2026-03-03T10:30:00Z",
  "data": {
    // Dados especificos do evento
  }
}
```

### Eventos do Agente IA

#### message_received
Quando o agente recebe uma mensagem do WhatsApp:

```json
{
  "event": "message_received",
  "timestamp": "2026-03-03T10:30:00Z",
  "data": {
    "phone": "5511987654321",
    "message": "Oi, gostaria de agendar uma consulta",
    "patientId": "uuid-do-paciente" // null se novo
  }
}
```

#### action_executed
Quando o agente executa uma acao:

```json
{
  "event": "action_executed",
  "timestamp": "2026-03-03T10:31:00Z",
  "data": {
    "action": "schedule_appointment" | "send_reminder" | "update_pipeline",
    "patientId": "uuid-do-paciente",
    "details": {
      // Detalhes especificos da acao
    }
  }
}
```

#### status_change
Quando o agente altera o status de um paciente:

```json
{
  "event": "status_change",
  "timestamp": "2026-03-03T10:31:00Z",
  "data": {
    "patientId": "uuid-do-paciente",
    "previousStatus": "novo_lead",
    "newStatus": "agendado",
    "reason": "Consulta agendada automaticamente"
  }
}
```

### Endpoints para o Agente IA

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/ai/patient/phone/:phone` | Busca paciente por telefone |
| POST | `/api/v1/ai/patient` | Cria paciente via IA |
| POST | `/api/v1/ai/appointment` | Agenda consulta via IA |
| GET | `/api/v1/ai/availability` | Consulta disponibilidade |
| POST | `/api/v1/ai/timeline` | Adiciona evento na timeline |
| POST | `/api/v1/ai/reminder` | Registra envio de lembrete |

#### GET /api/v1/ai/availability

Query Parameters:
- `professional` - Nome do profissional
- `date` - Data desejada
- `duration` - Duracao necessaria em minutos

Response:
```json
{
  "professional": "Dra. Marina Costa",
  "date": "2026-03-10",
  "availableSlots": [
    { "time": "09:00", "available": true },
    { "time": "10:00", "available": false },
    { "time": "11:00", "available": true },
    { "time": "14:00", "available": true },
    { "time": "15:00", "available": true }
  ]
}
```

#### POST /api/v1/ai/appointment

Request Body:
```json
{
  "patientPhone": "5511987654321",
  "professional": "Dra. Marina Costa",
  "date": "2026-03-10",
  "time": "09:00",
  "duration": 60,
  "type": "Avaliacao Geral",
  "notes": "Agendado automaticamente via WhatsApp"
}
```

Response:
```json
{
  "success": true,
  "appointment": {
    "id": "uuid-do-agendamento",
    "patientId": "uuid-do-paciente",
    "professional": "Dra. Marina Costa",
    "date": "2026-03-10",
    "time": "09:00",
    "status": "agendado",
    "aiScheduled": true
  },
  "message": "Consulta agendada com sucesso"
}
```

---

## Fluxo do Agente de IA

### 1. Captacao de Lead

```
Paciente envia mensagem
        │
        ▼
┌───────────────────┐
│ Agente recebe msg │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐     ┌──────────────────┐
│ Paciente existe?  │──NO─▶│ Criar paciente   │
└─────────┬─────────┘     │ source: ai_agent │
          │ YES           └────────┬─────────┘
          │                        │
          ▼                        ▼
┌───────────────────┐     ┌──────────────────┐
│ Atualizar ultima  │     │ status: novo_lead│
│   interacao       │     └────────┬─────────┘
└─────────┬─────────┘              │
          │                        │
          └────────────┬───────────┘
                       ▼
              ┌───────────────────┐
              │ Processar intent  │
              │ e responder       │
              └───────────────────┘
```

### 2. Agendamento Automatico

```
Paciente solicita agendamento
           │
           ▼
┌─────────────────────┐
│ Verificar preferencia│
│ de data/horario     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Consultar disponi-  │
│ bilidade na agenda  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────┐
│ Horario disponivel? │──NO─▶│ Sugerir alterna- │
└──────────┬──────────┘     │ tivas disponiveis│
           │ YES            └────────┬─────────┘
           │                         │
           ▼                         │
┌─────────────────────┐              │
│ Criar agendamento   │              │
│ aiScheduled: true   │              │
└──────────┬──────────┘              │
           │                         │
           ▼                         │
┌─────────────────────┐              │
│ Atualizar pipeline  │              │
│ status: agendado    │              │
└──────────┬──────────┘              │
           │                         │
           ▼                         ▼
┌─────────────────────────────────────────┐
│ Confirmar ao paciente via WhatsApp      │
└─────────────────────────────────────────┘
```

### 3. Lembretes Automaticos

```
┌─────────────────────────────────────────┐
│ Cron Job: Verificar consultas de amanha │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ Para cada consulta com status=agendado: │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ Enviar lembrete via WhatsApp            │
│ "Ola! Lembrando da sua consulta amanha  │
│  as XX:XX com Dr(a). XXX. Confirma?"    │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ Registrar evento na timeline            │
│ type: ai_action                         │
└─────────────────────────────────────────┘
```

---

## Variaveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/clinicai

# API do WhatsApp (Evolution API ou similar)
WHATSAPP_API_URL=https://api.whatsapp.exemplo.com
WHATSAPP_API_KEY=sua_chave_aqui
WHATSAPP_INSTANCE_ID=instance_123

# Agente de IA
AI_AGENT_SECRET=secret_para_webhook
AI_AGENT_URL=https://agente-ia.exemplo.com

# AI Provider (para o agente)
OPENAI_API_KEY=sk-xxx
# ou
ANTHROPIC_API_KEY=sk-ant-xxx

# Aplicacao
NEXT_PUBLIC_APP_URL=https://clinicai.exemplo.com
```

---

## Seguranca

### Autenticacao

- JWT para sessoes de usuarios do CRM
- API Key para integracao com agente de IA
- Webhook secret para validar requisicoes do agente

### Validacao de Webhook

```typescript
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request: Request) {
  const headersList = await headers()
  const signature = headersList.get("x-webhook-signature")
  const body = await request.text()
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.AI_AGENT_SECRET!)
    .update(body)
    .digest("hex")
  
  if (signature !== expectedSignature) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }
  
  // Processar webhook...
}
```

### Row Level Security (Supabase)

```sql
-- Politica para pacientes (clinica so ve seus proprios dados)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinica ve seus pacientes" ON patients
  FOR ALL USING (
    auth.jwt() ->> 'clinic_id' = clinic_id::text
  );

-- Politica para agendamentos
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinica ve seus agendamentos" ON appointments
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    )
  );
```

---

## Proximos Passos

1. **Implementar API Routes** - Criar endpoints no Next.js App Router
2. **Configurar Banco de Dados** - Setup Supabase ou Neon com schema
3. **Integrar WhatsApp** - Configurar Evolution API ou Baileys
4. **Desenvolver Agente IA** - Implementar logica com AI SDK
5. **Testes** - Criar suite de testes para API e integracao
6. **Deploy** - Configurar Vercel e variaveis de ambiente

---

## Contato

Para duvidas sobre a integracao com o Agente de IA, consulte a documentacao especifica em `/docs/AI-AGENT.md` (a ser criado).
