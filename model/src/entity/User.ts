import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from "typeorm";
import { Student } from "./Student";

@Entity({ name: "users" })
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    type: "decimal",
    nullable: true,
  })
  longitude: number;

  @Column({
    type: "decimal",
    nullable: true,
  })
  latitude: number;

  @Column()
  isAdmin: boolean;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Student, (student) => student.parentUser, {
    cascade: true,
    eager: true,
  })
  students: Student[];

  @Column({
    nullable: true,
  })
  confirmationCode: string;
}
