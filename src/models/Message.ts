import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Chat, (chat) => chat.messages, { eager: true, onDelete: "CASCADE" })
    chat!: Chat;

    @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
    sender!: User;

    @Column()
    content!: string;

    @Column({default: false})
    seen!: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}