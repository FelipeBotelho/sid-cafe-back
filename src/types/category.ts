/**
 * Tipos e interfaces para categorias
 */

export interface Category {
  id: number;
  nome: string;
  descricao: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  nome: string;
  descricao?: string;
}

export interface UpdateCategoryDto {
  nome?: string;
  descricao?: string;
}

export interface CategoryResponse {
  id: number;
  nome: string;
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters para listagem de categorias
 */
export interface CategoryListQuery {
  page?: string;
  limit?: string;
  search?: string; // Busca por nome ou descrição
  orderBy?: 'nome' | 'createdAt' | 'updatedAt';
  orderDir?: 'asc' | 'desc';
}

/**
 * Resposta paginada de categorias
 */
export interface CategoryListResponse {
  categories: CategoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}