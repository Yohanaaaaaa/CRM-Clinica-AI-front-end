import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable(),
  cpf: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  professional: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.enum(['ai_agent', 'whatsapp', 'manual']).optional(),
  pipelineStatus: z.enum(['novo_lead', 'agendado', 'confirmado', 'atendido', 'retorno', 'perdido']).optional(),
});

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { status, source, professional, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) where.pipelineStatus = status as any;
    if (source) where.source = source as any;
    if (professional) where.professional = professional as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: id as string },
      include: {
        appointments: true,
        timelineEvents: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const validatedData = patientSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      },
    });

    res.status(201).json(patient);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = patientSchema.partial().parse(req.body);
    
    const patient = await prisma.patient.update({
      where: { id: id as string },
      data: {
        ...validatedData,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
      },
    });

    res.json(patient);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id: id as string } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timeline = await prisma.timelineEvent.findMany({
      where: { patientId: id as string },
      orderBy: { createdAt: 'desc' },
    });
    res.json(timeline);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePatientPipeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const patient = await prisma.patient.update({
      where: { id: id as string },
      data: { pipelineStatus: status },
    });

    // Log the event
    await prisma.timelineEvent.create({
      data: {
        patientId: id as string,
        type: 'status_change',
        description: `Status alterado para ${status}`,
      },
    });

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
