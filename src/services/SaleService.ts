import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../database';
import { 
  CreateSaleDto, 
  UpdateSaleDto,
  SaleListQuery,
  SaleWithDetails,
  SaleListResponse,
  SaleStatsResponse,
  SaleStatus
} from '../types/sale';

export class SaleService {
  
  /**
   * Criar nova venda
   */
  async create(data: CreateSaleDto): Promise<SaleWithDetails> {
    // Verificar se o cliente existe
    const cliente = await prisma.user.findUnique({
      where: { id: data.clienteId }
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar produtos e estoque
    const produtoValidations = await Promise.all(
      data.itens.map(async (item) => {
        const produto = await prisma.product.findUnique({
          where: { id: item.produtoId }
        });

        if (!produto) {
          throw new Error(`Produto com ID ${item.produtoId} não encontrado`);
        }

        if (!produto.ativo) {
          throw new Error(`Produto "${produto.nome}" está inativo`);
        }

        if (produto.estoqueAtual < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoqueAtual}, Solicitado: ${item.quantidade}`);
        }

        return {
          produto,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario || produto.preco
        };
      })
    );

    // Calcular valores
    let valorTotal = new Decimal(0);
    const itensComCalculo = produtoValidations.map(({ produto, quantidade, precoUnitario }) => {
      const preco = typeof precoUnitario === 'number' ? new Decimal(precoUnitario) : precoUnitario;
      const valorItem = preco.mul(quantidade);
      valorTotal = valorTotal.add(valorItem);

      return {
        produtoId: produto.id,
        quantidade,
        precoUnitario: preco,
        valorTotal: valorItem
      };
    });

    const desconto = data.desconto ? new Decimal(data.desconto) : new Decimal(0);
    const valorFinal = valorTotal.sub(desconto);

    if (valorFinal.lt(0)) {
      throw new Error('Desconto não pode ser maior que o valor total');
    }

    // Criar venda em transação
    const sale = await prisma.$transaction(async (tx) => {
      // Criar cabeçalho da venda
      const novavenda = await tx.sale.create({
        data: {
          clienteId: data.clienteId,
          valorTotal,
          desconto,
          valorFinal,
          observacoes: data.observacoes || null,
          status: SaleStatus.PENDING
        },
        include: {
          cliente: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Criar itens da venda
      const itens = await Promise.all(
        itensComCalculo.map((item) =>
          tx.saleItem.create({
            data: {
              saleId: novavenda.id,
              ...item
            },
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  descricao: true,
                  preco: true,
                  estoqueAtual: true
                }
              }
            }
          })
        )
      );

      // Atualizar estoque dos produtos
      await Promise.all(
        itensComCalculo.map((item) =>
          tx.product.update({
            where: { id: item.produtoId },
            data: {
              estoqueAtual: {
                decrement: item.quantidade
              }
            }
          })
        )
      );

      return {
        ...novavenda,
        itens
      };
    });

    return sale as SaleWithDetails;
  }

  /**
   * Buscar venda por ID
   */
  async findById(id: number): Promise<SaleWithDetails | null> {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { id: true, name: true, email: true }
        },
        itens: {
          include: {
            produto: {
              select: {
                id: true,
                nome: true,
                descricao: true,
                preco: true,
                estoqueAtual: true
              }
            }
          }
        }
      }
    });

    return sale as SaleWithDetails | null;
  }

  /**
   * Listar vendas com filtros e paginação
   */
  async findAll(query: SaleListQuery): Promise<SaleListResponse> {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '20'), 100);
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (query.clienteId) {
      where.clienteId = parseInt(query.clienteId);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dataInicio || query.dataFim) {
      where.dataVenda = {};
      if (query.dataInicio) {
        where.dataVenda.gte = new Date(query.dataInicio);
      }
      if (query.dataFim) {
        where.dataVenda.lte = new Date(query.dataFim);
      }
    }

    if (query.valorMin || query.valorMax) {
      where.valorFinal = {};
      if (query.valorMin) {
        where.valorFinal.gte = new Decimal(query.valorMin);
      }
      if (query.valorMax) {
        where.valorFinal.lte = new Decimal(query.valorMax);
      }
    }

    // Construir ordenação
    const orderBy: any = {};
    const sortField = query.orderBy || 'dataVenda';
    const sortDirection = query.orderDir || 'desc';
    orderBy[sortField] = sortDirection;

    // Buscar vendas e contar total
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          cliente: {
            select: { id: true, name: true, email: true }
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  descricao: true,
                  preco: true,
                  estoqueAtual: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.sale.count({ where })
    ]);

    return {
      sales: sales as any[], // Conversão será feita no controller
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        clienteId: query.clienteId ? parseInt(query.clienteId) : undefined,
        status: query.status,
        dataInicio: query.dataInicio,
        dataFim: query.dataFim,
        valorMin: query.valorMin ? parseFloat(query.valorMin) : undefined,
        valorMax: query.valorMax ? parseFloat(query.valorMax) : undefined
      }
    } as SaleListResponse;
  }

  /**
   * Atualizar status da venda
   */
  async updateStatus(id: number, data: UpdateSaleDto): Promise<SaleWithDetails> {
    // Verificar se a venda existe
    const existingSale = await this.findById(id);
    if (!existingSale) {
      throw new Error('Venda não encontrada');
    }

    // Validar transição de status
    if (data.status && !this.isValidStatusTransition(existingSale.status, data.status)) {
      throw new Error(`Transição de status inválida de ${existingSale.status} para ${data.status}`);
    }

    // Se cancelando venda CONFIRMED ou PENDING, restaurar estoque
    if (data.status === SaleStatus.CANCELLED && 
        (existingSale.status === SaleStatus.CONFIRMED || existingSale.status === SaleStatus.PENDING)) {
      
      await prisma.$transaction(async (tx) => {
        // Restaurar estoque
        await Promise.all(
          existingSale.itens.map((item: any) =>
            tx.product.update({
              where: { id: item.produtoId },
              data: {
                estoqueAtual: {
                  increment: item.quantidade
                }
              }
            })
          )
        );

        // Atualizar venda
        await tx.sale.update({
          where: { id },
          data: {
            status: data.status,
            desconto: data.desconto !== undefined ? new Decimal(data.desconto) : undefined,
            observacoes: data.observacoes !== undefined ? data.observacoes : undefined,
            valorFinal: data.desconto !== undefined ? 
              existingSale.valorTotal.sub(new Decimal(data.desconto)) : undefined
          }
        });
      });
    } else {
      // Atualização simples sem mexer no estoque
      await prisma.sale.update({
        where: { id },
        data: {
          status: data.status,
          desconto: data.desconto !== undefined ? new Decimal(data.desconto) : undefined,
          observacoes: data.observacoes !== undefined ? data.observacoes : undefined,
          valorFinal: data.desconto !== undefined ? 
            existingSale.valorTotal.sub(new Decimal(data.desconto)) : undefined
        }
      });
    }

    // Retornar venda atualizada
    const updatedSale = await this.findById(id);
    return updatedSale!;
  }

  /**
   * Obter estatísticas de vendas
   */
  async getStats(): Promise<SaleStatsResponse> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimHoje = new Date(hoje);
    fimHoje.setHours(23, 59, 59, 999);

    const [
      totalVendas,
      totalFaturamento,
      vendasHoje,
      faturamentoHoje,
      vendasMes,
      faturamentoMes,
      statusStats,
      produtoMaisVendido,
      clienteTopFaturamento
    ] = await Promise.all([
      // Total vendas
      prisma.sale.count(),
      
      // Total faturamento
      prisma.sale.aggregate({
        _sum: { valorFinal: true },
        where: { status: { not: SaleStatus.CANCELLED } }
      }),
      
      // Vendas hoje
      prisma.sale.count({
        where: { 
          dataVenda: { gte: hoje, lte: fimHoje }
        }
      }),
      
      // Faturamento hoje
      prisma.sale.aggregate({
        _sum: { valorFinal: true },
        where: { 
          dataVenda: { gte: hoje, lte: fimHoje },
          status: { not: SaleStatus.CANCELLED }
        }
      }),
      
      // Vendas no mês
      prisma.sale.count({
        where: { 
          dataVenda: { gte: inicioMes }
        }
      }),
      
      // Faturamento no mês
      prisma.sale.aggregate({
        _sum: { valorFinal: true },
        where: { 
          dataVenda: { gte: inicioMes },
          status: { not: SaleStatus.CANCELLED }
        }
      }),

      // Distribuição por status
      prisma.sale.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Produto mais vendido
      prisma.saleItem.groupBy({
        by: ['produtoId'],
        _sum: { quantidade: true },
        orderBy: { _sum: { quantidade: 'desc' } },
        take: 1
      }),

      // Cliente top faturamento
      prisma.sale.groupBy({
        by: ['clienteId'],
        _sum: { valorFinal: true },
        where: { status: { not: SaleStatus.CANCELLED } },
        orderBy: { _sum: { valorFinal: 'desc' } },
        take: 1
      })
    ]);

    // Montar distribuição de status
    const statusDistribution = Object.values(SaleStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as { [key in SaleStatus]: number });

    statusStats.forEach((stat: any) => {
      if (stat.status in statusDistribution) {
        statusDistribution[stat.status as SaleStatus] = stat._count.status;
      }
    });

    // Buscar detalhes do produto mais vendido
    let produtoMaisVendidoInfo;
    if (produtoMaisVendido[0]) {
      const produto = await prisma.product.findUnique({
        where: { id: produtoMaisVendido[0].produtoId }
      });
      if (produto) {
        produtoMaisVendidoInfo = {
          id: produto.id,
          nome: produto.nome,
          quantidadeVendida: produtoMaisVendido[0]._sum.quantidade || 0
        };
      }
    }

    // Buscar detalhes do cliente top faturamento
    let clienteTopFaturamentoInfo;
    if (clienteTopFaturamento[0]) {
      const cliente = await prisma.user.findUnique({
        where: { id: clienteTopFaturamento[0].clienteId }
      });
      if (cliente) {
        clienteTopFaturamentoInfo = {
          id: cliente.id,
          name: cliente.name,
          totalCompras: (clienteTopFaturamento[0]._sum.valorFinal || new Decimal(0)).toString()
        };
      }
    }

    return {
      totalVendas,
      totalFaturamento: (totalFaturamento._sum.valorFinal || new Decimal(0)).toString(),
      vendasHoje,
      faturamentoHoje: (faturamentoHoje._sum.valorFinal || new Decimal(0)).toString(),
      vendasMes,
      faturamentoMes: (faturamentoMes._sum.valorFinal || new Decimal(0)).toString(),
      statusDistribution,
      produtoMaisVendido: produtoMaisVendidoInfo,
      clienteTopFaturamento: clienteTopFaturamentoInfo
    };
  }

  /**
   * Verificar se a transição de status é válida
   */
  private isValidStatusTransition(currentStatus: SaleStatus, newStatus: SaleStatus): boolean {
    const validTransitions: { [key in SaleStatus]: SaleStatus[] } = {
      [SaleStatus.PENDING]: [SaleStatus.CONFIRMED, SaleStatus.CANCELLED],
      [SaleStatus.CONFIRMED]: [SaleStatus.COMPLETED, SaleStatus.CANCELLED],
      [SaleStatus.CANCELLED]: [], // Não pode sair de cancelado
      [SaleStatus.COMPLETED]: [] // Não pode sair de completado
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * Buscar vendas por cliente
   */
  async findByCliente(clienteId: number, query: Partial<SaleListQuery>): Promise<SaleListResponse> {
    return this.findAll({
      ...query,
      clienteId: clienteId.toString()
    });
  }
}