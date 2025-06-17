import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class AiChat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    message!: string;

    @Column()
    response!: string;

    @Column()
    model!: string;

    @ManyToOne(() => User, user => user.aiChats)
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;
} 