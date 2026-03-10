import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.post('/webhook', aiController.handleWebhook);
router.get('/patient/phone/:phone', aiController.getPatientByPhone);
router.post('/patient', aiController.createPatientAI);
router.post('/appointment', aiController.scheduleAppointmentAI);
router.get('/availability', aiController.getAvailability);
router.post('/timeline', aiController.addTimelineEventAI);
router.post('/reminder', aiController.registerReminderAI);
router.get('/activity', aiController.getActivity);

export default router;
