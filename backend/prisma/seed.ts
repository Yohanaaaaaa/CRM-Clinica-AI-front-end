import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.timelineEvent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.professional.deleteMany();

  console.log('Database cleaned.');

  // Create Professionals
  const prof1 = await prisma.professional.create({
    data: {
      name: 'Dra. Ana Silva',
      specialty: 'Dermatologista',
      phone: '(11) 98765-4321',
      email: 'ana.silva@clinica.com',
    },
  });

  const prof2 = await prisma.professional.create({
    data: {
      name: 'Dr. Roberto Santos',
      specialty: 'Esteticista',
      phone: '(11) 91234-5678',
      email: 'roberto.santos@clinica.com',
    },
  });

  console.log('Professionals created.');

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Maria Oliveira',
      phone: '(11) 99999-1111',
      email: 'maria@gmail.com',
      pipelineStatus: 'novo_lead',
      source: 'ai_agent',
      professional: prof1.name,
      notes: 'Interessada em peeling químico.',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'João Pereira',
      phone: '(11) 98888-2222',
      email: 'joao@yahoo.com',
      pipelineStatus: 'agendado',
      source: 'whatsapp',
      professional: prof2.name,
      notes: 'Consulta de rotina.',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Lucia Costa',
      phone: '(11) 97777-3333',
      email: 'lucia@outlook.com',
      pipelineStatus: 'confirmado',
      source: 'manual',
      professional: prof1.name,
      notes: 'Primeira consulta.',
    },
  });

  console.log('Patients created.');

  // Create Appointments
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      professional: prof2.name,
      date: today,
      time: '14:00',
      duration: 60,
      status: 'agendado',
      type: 'Limpeza de Pele',
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient3.id,
      professional: prof1.name,
      date: tomorrow,
      time: '10:00',
      duration: 30,
      status: 'confirmado',
      type: 'Consulta Dermatológica',
    },
  });

  console.log('Appointments created.');

  // Create Timeline Events
  await prisma.timelineEvent.create({
    data: {
      patientId: patient1.id,
      type: 'ai_action',
      description: 'Agente IA iniciou conversa via WhatsApp.',
      aiGenerated: true,
    },
  });

  await prisma.timelineEvent.create({
    data: {
      patientId: patient2.id,
      type: 'appointment',
      description: 'Consulta agendada para hoje às 14:00.',
      aiGenerated: false,
    },
  });

  console.log('Timeline events created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
