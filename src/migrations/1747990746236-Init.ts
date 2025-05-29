import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747990746236 implements MigrationInterface {
    name = 'Init1747990746236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Check if user table exists
        const userTableExists = await queryRunner.hasTable("user");
        if (!userTableExists) {
            await queryRunner.query(`
                CREATE TABLE "user" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "username" character varying NOT NULL,
                    "email" character varying NOT NULL,
                    "password" character varying NOT NULL,
                    "phoneNumber" bigint,
                    "profileImage" jsonb NOT NULL DEFAULT '{"public_id":"","url":""}',
                    "token" character varying,
                    "online" boolean NOT NULL DEFAULT false,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                )
            `);
        }

        // Check if chat table exists
        const chatTableExists = await queryRunner.hasTable("chat");
        if (!chatTableExists) {
            await queryRunner.query(`
                CREATE TABLE "chat" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "user1Id" uuid,
                    "user2Id" uuid,
                    CONSTRAINT "PK_chat" PRIMARY KEY ("id"),
                    CONSTRAINT "FK_chat_user1" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_chat_user2" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE
                )
            `);
        }

        // Check if message table exists
        const messageTableExists = await queryRunner.hasTable("message");
        if (!messageTableExists) {
            await queryRunner.query(`
                CREATE TABLE "message" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "content" character varying NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "chatId" uuid,
                    "senderId" uuid,
                    CONSTRAINT "PK_message" PRIMARY KEY ("id"),
                    CONSTRAINT "FK_message_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_message_sender" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "message" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "chat" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    }
}
