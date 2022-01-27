import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Route } from "./Route";
import { School } from "./School";
import { User } from "./User";

@Entity({ name: "students" })
export class Student {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({
    type: "int",
    nullable: true,
  })
  id: number;

  @Column()
  firstName: string;

  @Column({
    nullable: true,
  })
  middleName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => School, school => school.students, { nullable: true, })
  school: School;

  @ManyToOne(() => Route, route => route.students, { nullable: true, })
  route: Route;

  @ManyToOne(() => User, user => user.students, { nullable: true, })
  parentUser: User;
}
