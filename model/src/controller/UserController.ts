import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import { isConstructorDeclaration } from "typescript";

@EntityRepository(User)
export class UserController extends Repository<User> {
  private userRepository = getRepository(User);

  async allUsers(request: Request, response: Response, next: NextFunction) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0
      // const isAdmin = response.locals.jwtPayload.isAdmin;
      // if (!isAdmin) {
      //   response.status(409).send("User is not an admin.")
      //   return;
      // }
      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == "none") {
        sortSpecification = "users.uid";
      } else {
        //should error check instead of else
        sortSpecification = "users." + request.params.sort;
      }
      if (request.params.sortDir == "none" || request.params.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else {
        //error check instead of else
        sortDirSpec = "DESC";
      }
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .skip(skipNum)
        .take(takeNum)
        .orderBy(sortSpecification, sortDirSpec)
        .getMany();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }
  async filterAllUsers(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0

      // const isAdmin = response.locals.jwtPayload.isAdmin;
      // if (!isAdmin) {
      //   response.status(409).send("User is not an admin.")
      //   return;
      // }
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;

      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == "none") {
        sortSpecification = "users.uid";
      } else {
        //should error check instead of else
        sortSpecification = "users." + request.query.sort;
      }
      if (request.query.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else if (request.query.sortDir == "DESC") {
        //error check instead of else
        sortDirSpec = "DESC";
      } else {
        sortDirSpec = "ASC";
        sortSpecification = "users.uid";
      }
      var filterSpecification;
      filterSpecification = "users." + request.query.sort;
      const queryFilterType = request.query.filterType;
      const queryFilterData = request.query.filterData;
      const [usersQueryResult, total] = await this.userRepository
        .createQueryBuilder("users")
        .skip(skipNum)
        .take(takeNum)
        .orderBy(sortSpecification, sortDirSpec)
        .where("users.email ilike '%' || :email || '%'", {
          email: queryFilterData,
        })
        .andWhere("users.lastName ilike '%' || :lastName || '%'", {
          lastName: queryFilterType,
        })
        .leftJoinAndSelect("users.students", "student")
        .getManyAndCount();
      response.status(200);
      return {
        users: usersQueryResult,
        total: total,
      };
    } catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }

  async currentUserJWT(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const uidNumber = response.locals.jwtPayload.uid;
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: uidNumber })
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send(
          "User UID: " +
          request.params.uid +
          " was not found adn could not be deleted."
        );
    }
  }

  async oneUser(request: Request, response: Response, next: NextFunction) {
    let { uid } = request.body;
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: uidNumber })
        .getOneOrFail();
      //const user = this.userRepository.findOne(request.params.id); same call example
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("User ID: " + request.params.uid + " was not found.");
      return;
    }
  }
  async saveNewUser(request: Request, response: Response, next: NextFunction) {
    try {
      return this.userRepository.save(request.body);
    } catch (e) {
      response
        .status(401)
        .send(
          "New User (" + request.body + ") couldn't be saved with error " + e
        );
      return;
    }
  }

  async updateUser(request: Request, response: Response, next: NextFunction) {
    try {
      // const isAdmin = response.locals.jwtPayload.isAdmin;
      // if (!isAdmin) {
      //   response.status(409).send("User is not an admin.")
      //   return;
      // }
      const uidNumber = request.params.uid;
      await getConnection()
        .createQueryBuilder()
        .update(User)
        .where("uid = :uid", { uid: uidNumber })
        .set(request.body)
        .execute();
      response.status(200);
    } catch (e) {
      response
        .status(401)
        .send(
          "User with UID " +
          request.params.uid +
          " and details(" +
          request.body +
          ") couldn't be updated with error " +
          e
        );
      return;
    }
  }

  async deleteUser(request: Request, response: Response, next: NextFunction) {
    try {
      // const isAdmin = response.locals.jwtPayload.isAdmin;
      // if (!isAdmin) {
      //   response.status(409).send("User is not an admin.")
      //   return;
      // }
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const userQuereyResult = await this.userRepository
        .createQueryBuilder("users")
        .delete()
        .where("users.uid = :uid", { uid: uidNumber })
        .execute();
      response.status(200);
    } catch (e) {
      response
        .status(401)
        .send(
          "User UID: " +
          request.params.uid +
          " was not found adn could not be deleted."
        );
    }
  }

  findByUserID(uid: number) {
    return this.createQueryBuilder("users")
      .where("users.uid = :uid", { uid })
      .getOne();
  }
  findByUserName(firstName: string) {
    return this.createQueryBuilder("users")
      .where("users.firstName = :firstName", { firstName })
      .getOne();
  }
  updateUserName(
    uid: number,
    firstName: string,
    middleName: string,
    lastName: string
  ) {
    return this.createQueryBuilder("users")
      .update()
      .set({ firstName: firstName, middleName: middleName, lastName: lastName })
      .where("users.uid = :uid", { uid })
      .execute();
  }
  getAssociatedStudents() {
    return this.createQueryBuilder("users")
      .leftJoinAndSelect("users.students", "students")
      .where("students.firstName = :firstName", {
        firstName: "firstStudentFirstName",
      })
      .getMany();
  }
}

function checkIfAdminForPrivileges(response) {
  const isAdmin = response.locals.jwtPayload.isAdmin;
  if (!isAdmin) {
    response.status(409).send("User is not an admin.")
    return;
  }
}
