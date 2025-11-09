import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

/**
 * @route GET /categories/stats
 * @desc Obter estatísticas de categorias
 * @access Public
 */
router.get('/stats', categoryController.getStats);

/**
 * @route POST /categories
 * @desc Criar nova categoria
 * @access Admin only
 */
router.post('/', authenticateToken, requireAdmin, categoryController.create);

/**
 * @route GET /categories
 * @desc Listar todas as categorias com paginação
 * @access Public
 */
router.get('/', categoryController.findAll);

/**
 * @route GET /categories/:id
 * @desc Buscar categoria por ID
 * @access Public
 */
router.get('/:id', categoryController.findById);

/**
 * @route PUT /categories/:id
 * @desc Atualizar categoria
 * @access Admin only
 */
router.put('/:id', authenticateToken, requireAdmin, categoryController.update);

/**
 * @route DELETE /categories/:id
 * @desc Deletar categoria
 * @access Admin only
 */
router.delete('/:id', authenticateToken, requireAdmin, categoryController.delete);

export { router as categoryRoutes };