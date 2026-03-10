import { Router } from 'express';
import * as pipelineController from '../controllers/pipeline.controller';

const router = Router();

router.get('/', pipelineController.getPipelineData);
router.get('/stats', pipelineController.getPipelineStats);
router.patch('/move', pipelineController.movePatient);

export default router;
