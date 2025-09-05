import { Client, IClient } from './client.model';
import { ApiError } from '../../common/errors';
import { buildSortQuery, buildFilterQuery } from '../../common/utils';
import { DEFAULT_PAGINATION } from '../../common/constants';

export class ClientService {
  static async createClient(clientData: Partial<IClient>): Promise<IClient> {
    try {
      const client = new Client(clientData);
      await client.save();
      return client;
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.conflict('Client name already exists', [
          { field: 'name', issue: 'Already exists' }
        ]);
      }
      throw error;
    }
  }

  static async getClientById(id: string): Promise<IClient> {
    const client = await Client.findById(id);

    if (!client) {
      throw ApiError.notFound('Client not found');
    }

    return client;
  }

  static async updateClient(id: string, updateData: Partial<IClient>): Promise<IClient> {
    const client = await Client.findById(id);

    if (!client) {
      throw ApiError.notFound('Client not found');
    }

    Object.assign(client, updateData);

    try {
      await client.save();
      return client;
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.conflict('Client name already exists', [
          { field: 'name', issue: 'Already exists' }
        ]);
      }
      throw error;
    }
  }

  static async deleteClient(id: string): Promise<void> {
    const client = await Client.findById(id);

    if (!client) {
      throw ApiError.notFound('Client not found');
    }

    // Soft delete
    client.isActive = false;
    await client.save();
  }

  static async listClients(
    filters: any = {},
    pagination: any = {}
  ): Promise<{
    clients: IClient[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // If `pagination.page` or `pagination.limit` are missing => fetch all clients
    const fetchAll = !pagination.page && !pagination.limit;

    // Build filters and sorting
    const query = buildFilterQuery(filters);
    const sort = buildSortQuery(pagination.sort);

    // If fetchAll is true, skip pagination
    if (fetchAll) {
      const [clients, total] = await Promise.all([
        Client.find(query).sort(sort),
        Client.countDocuments(query),
      ]);

      return {
        clients,
        meta: {
          page: 1,
          limit: total, // all clients count
          total,
          totalPages: 1, // since it's all in one page
        },
      };
    }

    // Normal paginated behavior
    const page = Math.max(1, pagination.page || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      pagination.limit || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Client.countDocuments(query),
    ]);

    return {
      clients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}