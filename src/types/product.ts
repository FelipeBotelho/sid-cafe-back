import { Decimal } from '@prisma/client/runtime/library';

/**
 * Tipos e interfaces para produtos
 */

export interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  preco: Decimal;
  categoriaId: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  categoria: {
    id: number;
    nome: string;
    descricao: string | null;
  };
}

export interface CreateProductDto {
  nome: string;
  descricao?: string;
  preco: number;
  categoriaId: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
}

export interface UpdateProductDto {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoriaId?: number;
  estoqueMinimo?: number;
  ativo?: boolean;
}

export interface UpdateStockDto {
  quantidade: number;
  tipo: 'entrada' | 'saida';
  motivo?: string;
}

export interface ProductResponse {
  id: number;
  nome: string;
  descricao: string | null;
  preco: string; // String para evitar problemas com Decimal no JSON
  categoriaId: number;
  categoria?: {
    id: number;
    nome: string;
    descricao: string | null;
  };
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  emFalta: boolean; // Computed field
  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters para listagem de produtos
 */
export interface ProductListQuery {
  page?: string;
  limit?: string;
  search?: string; // Busca por nome ou descrição
  categoriaId?: string; // Filtrar por categoria
  emFalta?: string; // 'true' para mostrar apenas produtos em falta
  ativo?: string; // 'true' | 'false' para filtrar por status
  onlyActive?: string; // 'true' | 'false' para produtos ativos apenas
  orderBy?: 'nome' | 'preco' | 'estoqueAtual' | 'createdAt' | 'updatedAt';
  orderDir?: 'asc' | 'desc';
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt'; // Swagger format
  sortOrder?: 'asc' | 'desc'; // Swagger format
  precoMin?: string; // Filtro de preço mínimo
  precoMax?: string; // Filtro de preço máximo
}

/**
 * Resposta paginada de produtos
 */
export interface ProductListResponse {
  products: ProductResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    categorias: Array<{
      id: number;
      nome: string;
      count: number;
    }>;
    precoRange: {
      min: string;
      max: string;
    };
    totalEmFalta: number;
    totalAtivos: number;
  };
}

/**
 * Estatísticas de produtos
 */
export interface ProductStats {
  totalProdutos: number;
  totalAtivos: number;
  totalInativos: number;
  totalEmFalta: number;
  valorTotalEstoque: string;
  produtoMaisCaro: ProductResponse | null;
  produtoMaisBarato: ProductResponse | null;
  categoriasComProdutos: number;
}

/**
 * Histórico de movimentação de estoque (para futuro)
 */
export interface StockMovement {
  id: number;
  productId: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  motivo?: string;
  createdAt: Date;
}

/**
 * Filtros para relatórios
 */
export interface ProductReportFilters {
  categoriaId?: number;
  dataInicio?: string;
  dataFim?: string;
  incluirInativos?: boolean;
}