import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748512016990 implements MigrationInterface {
    name = 'Init1748512016990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImage"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profileImage" jsonb NOT NULL DEFAULT '{"url": "", "public_id": ""}'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" bigint`);
    }

}
