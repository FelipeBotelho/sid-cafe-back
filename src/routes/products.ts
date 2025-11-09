import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products/stats:
 *   get:
 *     tags: [Products]
 *     summary: Obter estatísticas de produtos
 *     description: Retorna estatísticas gerais dos produtos (total, ativos, inativos, em falta)
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         active:
 *                           type: integer
 *                           example: 135
 *                         inactive:
 *                           type: integer
 *                           example: 15
 *                         outOfStock:
 *                           type: integer
 *                           example: 8
 *                         lowStock:
 *                           type: integer
 *                           example: 12
 *                         avgPrice:
 *                           type: number
 *                           example: 29.99
 */
router.get('/stats', productController.getStats);

/**
 * @swagger
 * /products/out-of-stock:
 *   get:
 *     tags: [Products]
 *     summary: Listar produtos em falta
 *     description: Lista produtos com estoque zerado ou em baixa
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 5
 *         description: Limite de estoque baixo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de produtos em falta obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 */
router.get('/out-of-stock', productController.findOutOfStock);

/**
 * @swagger
 * /products/category/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Buscar produtos por categoria
 *     description: Lista todos os produtos de uma categoria específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Mostrar apenas produtos ativos
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stock, createdAt]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de produtos da categoria obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                         category:
 *                           $ref: '#/components/schemas/Category'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/category/:id', productController.findByCategory);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Criar novo produto
 *     description: Cria um novo produto (somente para administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, requireAdmin, productController.create);

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Listar produtos com filtros
 *     description: Lista todos os produtos com suporte a paginação, busca e filtros
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: precoMin
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Preço mínimo
 *       - in: query
 *         name: precoMax
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Preço máximo
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Mostrar apenas produtos ativos
 *       - in: query
 *         name: hasStock
 *         schema:
 *           type: boolean
 *         description: Filtrar produtos com estoque
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stock, createdAt]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *                         filters:
 *                           type: object
 *                           properties:
 *                             categories:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Category'
 *                             priceRange:
 *                               type: object
 *                               properties:
 *                                 min:
 *                                   type: number
 *                                 max:
 *                                   type: number
 */
router.get('/', productController.findAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Buscar produto por ID
 *     description: Retorna um produto específico pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', productController.findById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Atualizar produto
 *     description: Atualiza um produto existente (somente para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Products]
 *     summary: Desativar produto (soft delete)
 *     description: Desativa um produto sem removê-lo do banco (somente para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto desativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, requireAdmin, productController.update);

router.delete('/:id', authenticateToken, requireAdmin, productController.softDelete);

/**
 * @swagger
 * /products/{id}/activate:
 *   post:
 *     tags: [Products]
 *     summary: Reativar produto
 *     description: Reativa um produto desativado (somente para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto reativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/activate', authenticateToken, requireAdmin, productController.activate);

/**
 * @swagger
 * /products/{id}/stock:
 *   post:
 *     tags: [Products]
 *     summary: Atualizar estoque do produto
 *     description: Atualiza a quantidade em estoque (somente para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - operation
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade a ser adicionada, removida ou definida
 *                 example: 50
 *               operation:
 *                 type: string
 *                 enum: [set, add, remove]
 *                 description: Operação - definir (set), adicionar (add) ou remover (remove)
 *                 example: add
 *               reason:
 *                 type: string
 *                 description: Motivo da alteração do estoque
 *                 example: "Reposição de estoque"
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *                         oldStock:
 *                           type: integer
 *                           example: 20
 *                         newStock:
 *                           type: integer
 *                           example: 70
 *                         operation:
 *                           type: string
 *                           example: add
 *       400:
 *         description: Dados inválidos ou operação não permitida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/stock', authenticateToken, requireAdmin, productController.updateStock);

export { router as productRoutes };