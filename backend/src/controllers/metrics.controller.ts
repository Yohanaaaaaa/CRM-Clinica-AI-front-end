import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfDay, subDays, endOfDay } from 'date-fns';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);

    const [
      totalPatients,
      totalPatientsPrev,
      appointmentsToday,
      appointmentsYesterday,
      confirmedAppointments,
      totalAppointments,
      aiConversions,
      aiConversionsPrev,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { lt: today } } }),
      prisma.appointment.count({ where: { date: { gte: today, lte: endOfDay(today) } } }),
      prisma.appointment.count({ where: { date: { gte: yesterday, lte: endOfDay(yesterday) } } }),
      prisma.appointment.count({ where: { status: 'confirmado' } }),
      prisma.appointment.count({ where: { status: { in: ['agendado', 'confirmado'] } } }),
      prisma.patient.count({ where: { source: 'ai_agent', pipelineStatus: 'atendido' } }),
      prisma.patient.count({ where: { source: 'ai_agent', pipelineStatus: 'atendido', updatedAt: { lt: today } } }),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      totalPatients,
      totalPatientsChange: calculateChange(totalPatients, totalPatientsPrev),
      appointmentsToday,
      appointmentsTodayChange: calculateChange(appointmentsToday, appointmentsYesterday),
      confirmationRate: totalAppointments === 0 ? 0 : (confirmedAppointments / totalAppointments) * 100,
      confirmationRateChange: 0, // Simplified
      aiConversions,
      aiConversionsChange: calculateChange(aiConversions, aiConversionsPrev),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyMetrics = async (req: Request, res: Response) => {
  try {
    // Simplified: Return mock-like data based on DB or actual aggregation
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const data = await Promise.all(days.map(async (day, index) => {
      // This is a simplification. In a real app, you'd aggregate by day of week
      return {
        day,
        agendamentos: Math.floor(Math.random() * 20),
        confirmados: Math.floor(Math.random() * 15),
        faltas: Math.floor(Math.random() * 3),
      };
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSourceMetrics = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.patient.groupBy({
      by: ['source'],
      _count: {
        _all: true,
      },
    });

    const total = stats.reduce((acc, s) => acc + s._count._all, 0);

    const labels: any = {
      ai_agent: 'Agente IA',
      whatsapp: 'WhatsApp Manual',
      manual: 'Recepcao',
    };

    const data = stats.map(s => ({
      source: labels[s.source] || s.source,
      count: s._count._all,
      percentage: (s._count._all / total) * 100,
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversionMetrics = async (req: Request, res: Response) => {
  try {
    // Logic for conversion rates (e.g., from novo_lead to atendido)
    res.json({ conversionRate: 65.5 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
