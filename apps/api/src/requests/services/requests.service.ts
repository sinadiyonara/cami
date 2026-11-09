import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from '../entities/customer-request.entity';

export type RequestListItem = {
  id: string;
  message: string;
  status: RequestStatus;
  category: string | null;
  confidence: number | null;
  noteCount: number;
  latestNotePreview: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(CustomerRequest)
    private readonly requests: Repository<CustomerRequest>
  ) {}

  async list(): Promise<RequestListItem[]> {
    // Each LATERAL subquery runs once per request against the
    // (request_id, created_at DESC, id DESC) index: the count is an index-only scan and the
    // latest note is a single LIMIT 1 probe, so only one note body per request is read.
    // LEFT JOIN ... ON true keeps requests that have no notes.
    const rows: (Omit<RequestListItem, 'createdAt' | 'updatedAt'> & {
      createdAt: Date;
      updatedAt: Date;
    })[] = await this.requests.query(`
      SELECT
        r.id,
        r.message,
        r.status,
        r.category,
        r.confidence,
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt",
        nc.count AS "noteCount",
        ln.body AS "latestNotePreview"
      FROM customer_requests r
      CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM request_notes n
        WHERE n.request_id = r.id
      ) nc
      LEFT JOIN LATERAL (
        SELECT n.body
        FROM request_notes n
        WHERE n.request_id = r.id
        ORDER BY n.created_at DESC, n.id DESC
        LIMIT 1
      ) ln ON true
      ORDER BY r.created_at DESC, r.id DESC
    `);

    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getById(id: string): Promise<CustomerRequest> {
    const row = await this.requests.findOne({
      where: { id },
      relations: { notes: true },
    });
    if (!row) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    return row;
  }

  async updateStatus(id: string, status: RequestStatus): Promise<CustomerRequest> {
    const row = await this.getById(id);
    row.status = status;
    return this.requests.save(row);
  }

  async create(message: string): Promise<CustomerRequest> {
    const row = this.requests.create({
      message,
      status: 'open',
      category: null,
      confidence: null,
    });
    return this.requests.save(row);
  }
}
