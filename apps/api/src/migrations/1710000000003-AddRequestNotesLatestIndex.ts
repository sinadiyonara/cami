import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Supports RequestsService.list(): the latest-note lookup becomes a single index probe
 * (request_id, then newest first), and the note count can be served from the same index.
 * It also covers plain request_id lookups, so the old single-column index is redundant.
 */
export class AddRequestNotesLatestIndex1710000000003 implements MigrationInterface {
  name = 'AddRequestNotesLatestIndex1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_request_notes_request_id_created_at
      ON request_notes(request_id, created_at DESC, id DESC);
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_request_notes_request_id;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_request_notes_request_id
      ON request_notes(request_id);
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_request_notes_request_id_created_at;`);
  }
}
