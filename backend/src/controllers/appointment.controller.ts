import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  professional: z.string().min(1),
  date: z.string(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  duration: z.number().int().positive().default(30),
  type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  aiScheduled: z.boolean().default(false),
  status: z.enum(['agendado', 'confirmado', 'cancelado', 'realizado', 'falta']).optional(),
});

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { date, startDate, endDate, professional, status, patientId } = req.query;
    const where: any = {};

    if (date) {
      where.date = new Date(date as string);
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (professional) where.professional = professional as string;
    if (status) where.status = status as any;
    if (patientId) where.patientId = patientId as string;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: { select: { name: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: id as string },
      include: { patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    
    const appointment = await prisma.$transaction(async (tx: any) => {
      const app = await tx.appointment.create({
        data: {
          ...validatedData,
          date: new Date(validatedData.date),
        },
      });

      // Update patient pipeline if scheduled via IA or just regular scheduling
      await tx.patient.update({
        where: { id: validatedData.patientId },
        data: {
          pipelineStatus: 'agendado',
          lastInteraction: new Date(),
        },
      });

      // Add to timeline
      await tx.timelineEvent.create({
        data: {
          patientId: validatedData.patientId,
          type: 'appointment',
          description: `Novo agendamento criado para ${validatedData.date} as ${validatedData.time}`,
          aiGenerated: validatedData.aiScheduled,
        },
      });

      return app;
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = appointmentSchema.partial().parse(req.body);

    const appointment = await prisma.appointment.update({
      where: { id: id as string },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
    });

    res.json(appointment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: id as string } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id: id as string },
      data: { status: 'confirmado' },
    });

    await prisma.patient.update({
      where: { id: appointment.patientId },
      data: { pipelineStatus: 'confirmado' },
    });

    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id: id as string },
      data: { status: 'realizado' },
    });

    await prisma.patient.update({
      where: { id: appointment.patientId },
      data: { pipelineStatus: 'atendido' },
    });

    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
