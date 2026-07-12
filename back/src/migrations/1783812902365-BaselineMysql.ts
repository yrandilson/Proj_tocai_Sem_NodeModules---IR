import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineMysql1783812902365 implements MigrationInterface {
    name = 'BaselineMysql1783812902365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('NEW_PROPOSAL', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'NEW_MESSAGE', 'item_deleted', 'item_deleted_by_admin', 'match_found', 'item_created', 'item_updated', 'user_registered', 'item_available') NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`link\` varchar(255) NULL, \`metadata\` text NULL, \`read\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trade_preferences\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`itemId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` text NOT NULL, \`senderId\` int NOT NULL, \`receiverId\` int NOT NULL, \`itemId\` int NOT NULL, \`proposalId\` int NULL, \`read\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`report_history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reportId\` int NOT NULL, \`changedByUserId\` int NOT NULL, \`oldStatus\` varchar(20) NOT NULL, \`newStatus\` varchar(20) NOT NULL, \`actionTaken\` text NULL, \`changedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reports\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reason\` varchar(255) NOT NULL, \`description\` text NULL, \`status\` enum ('pendente', 'em_analise', 'resolvida', 'rejeitada') NOT NULL DEFAULT 'pendente', \`reporterId\` int NULL, \`reportedUserId\` int NULL, \`reportedItemId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(2048) NOT NULL, \`itemId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ownerId\` int NOT NULL, \`titulo\` varchar(255) NOT NULL, \`descricao\` text NOT NULL, \`categoria\` varchar(255) NULL, \`status\` enum ('disponivel', 'em_negociacao', 'trocado') NOT NULL DEFAULT 'disponivel', \`latitude\` decimal(10,7) NULL, \`longitude\` decimal(10,7) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, INDEX \`IDX_0831f71549426dcdff6c67c9b7\` (\`ownerId\`), INDEX \`IDX_36275759f2cbc3b5ca32f39341\` (\`status\`), INDEX \`IDX_b277d1dffed045eeaf2e61f178\` (\`categoria\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`proposals\` (\`id\` int NOT NULL AUTO_INCREMENT, \`itemId\` int NOT NULL, \`proposerId\` int NOT NULL, \`mensagem\` text NOT NULL, \`status\` enum ('pendente', 'aceita', 'recusada') NOT NULL DEFAULT 'pendente', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rating\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` int NOT NULL, \`comment\` text NULL, \`itemConformeDescricao\` tinyint NOT NULL DEFAULT 0, \`comunicacaoClara\` tinyint NOT NULL DEFAULT 0, \`prazoCumprido\` tinyint NOT NULL DEFAULT 0, \`recomendariaUsuario\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`fromUserId\` int NULL, \`toUserId\` int NULL, \`proposalId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`telefone\` varchar(20) NULL, \`senha\` varchar(255) NOT NULL, \`role\` varchar(20) NOT NULL DEFAULT 'common', \`pushSubscription\` text NULL, \`isBlocked\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`favorites\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`itemId\` int NULL, UNIQUE INDEX \`IDX_847db5511e5403fc72fa91518f\` (\`userId\`, \`itemId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tokenHash\` varchar(255) NOT NULL, \`userId\` int NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_610102b60fea1455310ccd299d\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trade_preferences\` ADD CONSTRAINT \`FK_12f9a8f31bf6c889ab94883c68d\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_fc6b58e41e9a871dacbe9077def\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_9a197c82c9ea44d75bc145a6e2c\` FOREIGN KEY (\`receiverId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_e8ef4517fba8bb11181fa5546f6\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_7eca11bbaa6b800f8697767f5a1\` FOREIGN KEY (\`proposalId\`) REFERENCES \`proposals\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`report_history\` ADD CONSTRAINT \`FK_63caa9a80b1342c0757645e3e22\` FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`report_history\` ADD CONSTRAINT \`FK_aa7ff18256cd96fc622f0d4b23d\` FOREIGN KEY (\`changedByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_4353be8309ce86650def2f8572d\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_c88d2686339ad6d166620b741a6\` FOREIGN KEY (\`reportedUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_27e25d494412445b1a38d55d2e4\` FOREIGN KEY (\`reportedItemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`images\` ADD CONSTRAINT \`FK_01fe9039225797dbb2f43f6c074\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_0831f71549426dcdff6c67c9b78\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`proposals\` ADD CONSTRAINT \`FK_6663a9d7c53ba58721236eb3a1c\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`proposals\` ADD CONSTRAINT \`FK_9525673e3f071a1c800ba9332d4\` FOREIGN KEY (\`proposerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_56498248d0a34c261f6adc6784d\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_c8066e4e2a89a0fde9f4eb054c9\` FOREIGN KEY (\`toUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_3365bb285321a92eb65f22ff00f\` FOREIGN KEY (\`proposalId\`) REFERENCES \`proposals\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_e747534006c6e3c2f09939da60f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_df440549cfc7b88e9bd9ec80f7a\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_df440549cfc7b88e9bd9ec80f7a\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_e747534006c6e3c2f09939da60f\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_3365bb285321a92eb65f22ff00f\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_c8066e4e2a89a0fde9f4eb054c9\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_56498248d0a34c261f6adc6784d\``);
        await queryRunner.query(`ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_9525673e3f071a1c800ba9332d4\``);
        await queryRunner.query(`ALTER TABLE \`proposals\` DROP FOREIGN KEY \`FK_6663a9d7c53ba58721236eb3a1c\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_0831f71549426dcdff6c67c9b78\``);
        await queryRunner.query(`ALTER TABLE \`images\` DROP FOREIGN KEY \`FK_01fe9039225797dbb2f43f6c074\``);
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_27e25d494412445b1a38d55d2e4\``);
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_c88d2686339ad6d166620b741a6\``);
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_4353be8309ce86650def2f8572d\``);
        await queryRunner.query(`ALTER TABLE \`report_history\` DROP FOREIGN KEY \`FK_aa7ff18256cd96fc622f0d4b23d\``);
        await queryRunner.query(`ALTER TABLE \`report_history\` DROP FOREIGN KEY \`FK_63caa9a80b1342c0757645e3e22\``);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_7eca11bbaa6b800f8697767f5a1\``);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_e8ef4517fba8bb11181fa5546f6\``);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_9a197c82c9ea44d75bc145a6e2c\``);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_fc6b58e41e9a871dacbe9077def\``);
        await queryRunner.query(`ALTER TABLE \`trade_preferences\` DROP FOREIGN KEY \`FK_12f9a8f31bf6c889ab94883c68d\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\``);
        await queryRunner.query(`DROP INDEX \`IDX_610102b60fea1455310ccd299d\` ON \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_847db5511e5403fc72fa91518f\` ON \`favorites\``);
        await queryRunner.query(`DROP TABLE \`favorites\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`rating\``);
        await queryRunner.query(`DROP TABLE \`proposals\``);
        await queryRunner.query(`DROP INDEX \`IDX_b277d1dffed045eeaf2e61f178\` ON \`items\``);
        await queryRunner.query(`DROP INDEX \`IDX_36275759f2cbc3b5ca32f39341\` ON \`items\``);
        await queryRunner.query(`DROP INDEX \`IDX_0831f71549426dcdff6c67c9b7\` ON \`items\``);
        await queryRunner.query(`DROP TABLE \`items\``);
        await queryRunner.query(`DROP TABLE \`images\``);
        await queryRunner.query(`DROP TABLE \`reports\``);
        await queryRunner.query(`DROP TABLE \`report_history\``);
        await queryRunner.query(`DROP TABLE \`chat_messages\``);
        await queryRunner.query(`DROP TABLE \`trade_preferences\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
    }

}
