import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();
const healthController = new HealthController();

// Health check routes
router.get('/health', healthController.checkHealth);
router.get('/health/detailed', healthController.checkDetailedHealth);

export default router;