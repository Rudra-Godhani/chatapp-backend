import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
    user1!: User;

    @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
    user2!: User;

    @OneToMany(() => Message, (message) => message.chat, { cascade: true })
    messages!: Message[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}