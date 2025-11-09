import { Router } from 'express';
import { HealthController } from '../controllers';
import healthRoutes from './health';
import { authRoutes } from './auth';
import { protectedRoutes } from './protected';
import { categoryRoutes } from './categories';
import { productRoutes } from './products';

const router = Router();
const healthController = new HealthController();

// Root endpoint
router.get('/', healthController.welcome);

// Module routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

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