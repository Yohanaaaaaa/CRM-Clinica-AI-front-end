import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';

const router = Router();

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);
router.patch('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);
router.get('/:id/timeline', patientController.getPatientTimeline);
router.patch('/:id/pipeline', patientController.updatePatientPipeline);

export default router;
