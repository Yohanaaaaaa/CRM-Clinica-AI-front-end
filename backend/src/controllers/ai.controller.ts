import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const body = JSON.stringify(req.body);
    
    // In a real scenario, you'd validate the signature
    /*
    const expectedSignature = crypto
      .createHmac('sha256', process.env.AI_AGENT_SECRET!)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    */

    const { event, data } = req.body;

    switch (event) {
      case 'message_received':
        // Update last interaction
        if (data.patientId) {
          await prisma.patient.update({
            where: { id: data.patientId },
            data: { lastInteraction: new Date() },
          });
        }
        break;
      
      case 'status_change':
        await prisma.patient.update({
          where: { id: data.patientId },
          data: { 
            pipelineStatus: data.newStatus,
            lastInteraction: new Date(),
          },
        });
        break;
      
      // Handle other events...
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const patient = await prisma.patient.findFirst({
      where: { phone: phone as string },
    });
    
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPatientAI = async (req: Request, res: Response) => {
  try {
    const patient = await prisma.patient.create({
      data: {
        ...req.body,
        source: 'ai_agent',
        pipelineStatus: 'novo_lead',
      },
    });
    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleAppointmentAI = async (req: Request, res: Response) => {
  try {
    const { patientPhone, professional, date, time, duration, type, notes } = req.body;
    
    let patient = await prisma.patient.findFirst({ where: { phone: patientPhone } });
    
    if (!patient) {
        // Create patient if doesn't exist? Or return error
        return res.status(404).json({ error: 'Patient not found' });
    }

    const appointment = await prisma.$transaction(async (tx: any) => {
      const app = await tx.appointment.create({
        data: {
          patientId: patient!.id,
          professional,
          date: new Date(date),
          time,
          duration: duration || 30,
          type,
          notes,
          aiScheduled: true,
          status: 'agendado',
        },
      });

      await tx.patient.update({
        where: { id: patient!.id },
        data: { pipelineStatus: 'agendado', lastInteraction: new Date() },
      });

      return app;
    });

    res.json({ success: true, appointment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { professional, date } = req.query;
    
    const appointments = await prisma.appointment.findMany({
      where: {
        professional: professional as string,
        date: new Date(date as string),
      },
    });

    const busySlots = appointments.map((a: any) => a.time);
    const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    const availableSlots = allSlots.map(time => ({
      time,
      available: !busySlots.includes(time),
    }));

    res.json({ professional, date, availableSlots });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTimelineEventAI = async (req: Request, res: Response) => {
  try {
    const { patientId, type, description } = req.body;
    const event = await prisma.timelineEvent.create({
      data: {
        patientId,
        type,
        description,
        aiGenerated: true,
      },
    });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const registerReminderAI = async (req: Request, res: Response) => {
  try {
    const { patientId, appointmentId } = req.body;
    const event = await prisma.timelineEvent.create({
      data: {
        patientId,
        type: 'ai_action',
        description: `Lembrete de consulta enviado via WhatsApp para o agendamento ${appointmentId}`,
        aiGenerated: true,
      },
    });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { aiGenerated: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
