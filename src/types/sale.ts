import { Decimal } from '@prisma/client/runtime/library';
import { User, Product } from '@prisma/client';

/**
 * Enum para status das vendas
 */
export enum SaleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

/**
 * Tipo base para Sale
 */
export interface Sale {
  id: number;
  clienteId: number;
  valorTotal: Decimal;
  desconto: Decimal | null;
  valorFinal: Decimal;
  status: SaleStatus;
  observacoes: string | null;
  dataVenda: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo base para SaleItem
 */
export interface SaleItem {
  id: number;
  saleId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: Decimal;
  valorTotal: Decimal;
  createdAt: Date;
}

/**
 * DTO para criar um item de venda
 */
export interface CreateSaleItemDto {
  produtoId: number;
  quantidade: number;
  precoUnitario?: number; // Opcional, pega do produto se não informado
}

/**
 * DTO para criar uma venda
 */
export interface CreateSaleDto {
  clienteId: number;
  itens: CreateSaleItemDto[];
  desconto?: number; // Valor do desconto
  observacoes?: string;
}

/**
 * DTO para atualizar uma venda
 */
export interface UpdateSaleDto {
  status?: SaleStatus;
  desconto?: number;
  observacoes?: string;
}

/**
 * DTO para filtros de consulta de vendas
 */
export interface SaleListQuery {
  page?: string;
  limit?: string;
  clienteId?: string; // Filtrar por cliente
  status?: SaleStatus; // Filtrar por status
  dataInicio?: string; // Data início para filtro de período
  dataFim?: string; // Data fim para filtro de período
  valorMin?: string; // Valor mínimo
  valorMax?: string; // Valor máximo
  orderBy?: 'dataVenda' | 'valorFinal' | 'status' | 'createdAt';
  orderDir?: 'asc' | 'desc';
}

/**
 * Tipo para venda com relacionamentos
 */
export interface SaleWithDetails extends Sale {
  cliente: Pick<User, 'id' | 'name' | 'email'>;
  itens: SaleItemWithProduct[];
}

/**
 * Tipo para item de venda com produto
 */
export interface SaleItemWithProduct extends SaleItem {
  produto: Pick<Product, 'id' | 'nome' | 'descricao' | 'preco' | 'estoqueAtual'>;
}

/**
 * Response formatada para venda
 */
export interface SaleResponse {
  id: number;
  clienteId: number;
  cliente: {
    id: number;
    name: string;
    email: string;
  };
  itens: SaleItemResponse[];
  valorTotal: string; // String para evitar problemas com Decimal
  desconto: string;
  valorFinal: string;
  status: SaleStatus;
  observacoes: string | null;
  dataVenda: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response formatada para item de venda
 */
export interface SaleItemResponse {
  id: number;
  produtoId: number;
  produto: {
    id: number;
    nome: string;
    descricao: string | null;
    precoAtual: string; // Preço atual do produto
  };
  quantidade: number;
  precoUnitario: string; // Preço no momento da venda
  valorTotal: string;
}

/**
 * Response para listagem de vendas com paginação
 */
export interface SaleListResponse {
  sales: SaleResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    clienteId?: number;
    status?: SaleStatus;
    dataInicio?: string;
    dataFim?: string;
    valorMin?: number;
    valorMax?: number;
  };
}

/**
 * Response para estatísticas de vendas
 */
export interface SaleStatsResponse {
  totalVendas: number;
  totalFaturamento: string;
  vendasHoje: number;
  faturamentoHoje: string;
  vendasMes: number;
  faturamentoMes: string;
  statusDistribution: {
    [key in SaleStatus]: number;
  };
  produtoMaisVendido?: {
    id: number;
    nome: string;
    quantidadeVendida: number;
  };
  clienteTopFaturamento?: {
    id: number;
    name: string;
    totalCompras: string;
  };
}

