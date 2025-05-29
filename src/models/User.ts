import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    Length,
    Matches,
    MinLength,
} from "class-validator";
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @IsNotEmpty({ message: "Username is required." })
    username!: string;

    @Column({ unique: true })
    @IsEmail({}, { message: "Please enter a valid email address." })
    @IsNotEmpty({ message: "Email is required." })
    email!: string;

    @Column()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                "Password must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.",
        }
    )
    @MinLength(8, { message: "Password must be at least 8 characters long." })
    @IsNotEmpty({ message: "Password is required." })
    password!: string;

    @Column({ nullable: true })
    @IsOptional()
    token!: string;

    @Column({ default: false })
    online!: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
