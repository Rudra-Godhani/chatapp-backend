import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Chat, (chat) => chat.messages, { eager: true })
    chat!: Chat;

    @ManyToOne(() => User, { eager: true })
    sender!: User;

    @Column()
    content!: string;

    @Column({default: false})
    seen!: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}