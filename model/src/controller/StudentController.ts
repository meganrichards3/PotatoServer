import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Student } from "../entity/Student";

@EntityRepository(Student)
export class StudentController extends Repository<Student> {
  private studentRepository = getRepository(Student);

  async allStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "students.uid";
      }
      else { //should error check instead of else
        sortSpecification = "students." + request.query.sort;
      }
      if ((request.query.sortDir == 'none') || (request.query.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const studentsQueryResult = await this.studentRepository.createQueryBuilder("students").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return studentsQueryResult;
    }
    catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async filterAllStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;

      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "students.uid";
      } else if (request.query.sort == 'school.name') {
        sortSpecification = "school.name";
      } else { //should error check instead of else
        sortSpecification = "students." + request.query.sort;
      }
      if (request.query.sortDir == 'ASC') {
        sortDirSpec = "ASC";
      }
      else if (request.query.sortDir == 'DESC') { //error check instead of else
        sortDirSpec = "DESC";
      } else {
        sortDirSpec = "ASC";
        sortSpecification = "students.uid";
      }
      var filterSpecification;
      filterSpecification = "students." + request.query.sort;
      const queryIdFilter = request.query.idFilter;
      const queryLastNameFilter = request.query.lastNameFilter;
      var studentsQueryResult;
      var total;
      if (queryIdFilter) {
        const result = await this.studentRepository
          .createQueryBuilder("students")
          .skip(skipNum)
          .take(takeNum)
          .orderBy(sortSpecification, sortDirSpec)
          .where("students.id ilike '%' || :id || '%'", { id: queryIdFilter })
          .andWhere("students.lastName ilike '%' || :lastName || '%'", { lastName: queryLastNameFilter })
          .leftJoinAndSelect("students.route", "route")
          .leftJoinAndSelect("students.school", "school")
          .getManyAndCount();
        studentsQueryResult = result[0];
        total = result[1];
      } else {
        const result = await this.studentRepository
          .createQueryBuilder("students")
          .skip(skipNum)
          .take(takeNum)
          .orderBy(sortSpecification, sortDirSpec)
          .where("students.lastName ilike '%' || :lastName || '%'", { lastName: queryLastNameFilter })
          .leftJoinAndSelect("students.route", "route")
          .leftJoinAndSelect("students.school", "school")
          .getManyAndCount();
        studentsQueryResult = result[0];
        total = result[1];
      }
      response.status(200);
      return {
        students: studentsQueryResult,
        total: total
      };
    }
    catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async oneStudent(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.studentRepository
        .createQueryBuilder("students")
        .where("students.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("students.route", "route")
        .leftJoinAndSelect("students.school", "school")
        .leftJoinAndSelect("students.parentUser", "user")
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;


    }
    catch (e) {
      response
        .status(401)
        .send("Student with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewStudent(request: Request, response: Response, next: NextFunction) {
    try {
      return this.studentRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New Student (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateStudent(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      await getConnection().createQueryBuilder().update(Student).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
      return;

    }

    catch (e) {
      response
        .status(401)
        .send("Student with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteStudent(request: Request, response: Response, next: NextFunction) {
    try {

      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const studentQueryResult = await this.studentRepository.createQueryBuilder("students").delete().where("students.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);
    }
    catch (e) {
      response.status(401).send("Student UID: " + request.params.uid + " was not found adn could not be deleted.")
    }
  }
  findByStudentID(uid: number) {
    return this.createQueryBuilder("students")
      .where("students.uid = :uid", { uid })
      .getOne();
  }
  findByStudentName(firstName: string) {
    return this.createQueryBuilder("students")
      .where("students.firstName = :firstName", { firstName })
      .getOne();
  }
  updateStudentName(
    studentId: number,
    firstName: string,
    middleName: string,
    lastName: string
  ) {
    return this.createQueryBuilder("students")
      .update()
      .set({ firstName: firstName, middleName: middleName, lastName: lastName })
      .where("students.uid = :uid", { studentId })
      .execute();
  }


}
