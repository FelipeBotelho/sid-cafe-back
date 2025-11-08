import { Router } from 'express';
import { HealthController } from '../controllers';
import healthRoutes from './health';

const router = Router();
const healthController = new HealthController();

// Root endpoint
router.get('/', healthController.welcome);

// Module routes
router.use('/', healthRoutes);

// Example route for future use
router.get('/example', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de exemplo funcionando!',
    data: { example: 'data' },
    timestamp: new Date().toISOString()
  });
});

export default router;