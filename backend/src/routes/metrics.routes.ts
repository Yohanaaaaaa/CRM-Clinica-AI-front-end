import { Router } from 'express';
import * as metricsController from '../controllers/metrics.controller';

const router = Router();

router.get('/dashboard', metricsController.getDashboardMetrics);
router.get('/weekly', metricsController.getWeeklyMetrics);
router.get('/sources', metricsController.getSourceMetrics);
router.get('/conversion', metricsController.getConversionMetrics);

export default router;
