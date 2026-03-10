import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { PipelineStatus } from '@prisma/client';

export const getPipelineData = async (req: Request, res: Response) => {
  try {
    const statuses: PipelineStatus[] = ['novo_lead', 'agendado', 'confirmado', 'atendido', 'retorno', 'perdido'];
    
    const patients = await prisma.patient.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    const columns: any = {};
    
    statuses.forEach(status => {
      const filtered = patients.filter(p => p.pipelineStatus === status);
      columns[status] = {
        label: status.replace('_', ' ').toUpperCase(),
        count: filtered.length,
        patients: filtered,
      };
    });

    res.json({ columns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPipelineStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.patient.groupBy({
      by: ['pipelineStatus'],
      _count: {
        _all: true,
      },
    });

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const movePatient = async (req: Request, res: Response) => {
  try {
    const { patientId, newStatus } = req.body;
    
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: { pipelineStatus: newStatus },
    });

    await prisma.timelineEvent.create({
      data: {
        patientId,
        type: 'status_change',
        description: `Paciente movido para ${newStatus}`,
      },
    });

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
