import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Route } from "./Route";
import { Student } from "./Student";

@Entity({ name: "schools" })
export class School {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  name: string;

  @Column()
  unique_name: string;

  @Column()
  address: string;

  @Column("decimal")
  longitude: number;

  @Column("decimal")
  latitude: number;

  @OneToMany(() => Student, (student) => student.school, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  students: Student[];

  @OneToMany(() => Route, (route) => route.school, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  routes: Route[];

  @Column({ type: "time" })
  arrival_time: string;

  @Column({ type: "time" })
  departure_time: string;
}
