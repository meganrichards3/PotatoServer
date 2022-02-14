import { createConnection, getConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
import { School } from "../entity/School";
import { User } from "../entity/User";
import { publishMessage } from "./emailWorker";
import { Request, Response } from "express";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

export class EmailController {
  private getParentPage = async (parentId: number) => {
    const userDetail: User = await getRepository(User)
      .createQueryBuilder("users")
      .where("users.uid = :uid", { uid: parentId })
      .leftJoinAndSelect("users.students", "children")
      .leftJoinAndSelect("children.school", "school")
      .getOne();

    // TODO: possiblly resolve this 100% script injection risk
    var info = "<h3>" + this.extractName(userDetail) + "</h3>";
    console.log(userDetail);
    if (!("students" in userDetail) || userDetail.students.length == 0) {
      info =
        "<div>" +
        info +
        "<p>" +
        "You don't have any registerd child in the system." +
        "</p>" +
        "</div>";

      return info;
    }

    for (const child of userDetail.students) {
      info +=
        "<p>" +
        this.extractName(child) +
        "<br>" +
        ("id" in child && child.id != null ? "Student ID: " + child.id : "") +
        "<br>" +
        "School: " +
        child.school.name +
        "</p>";
    }

    return "<div>" + info + "</div>";
  };

  private extractName = (user) => {
    return (
      user.firstName +
      ("middlename" in user ? user.middleName : "") +
      " " +
      user.lastName
    );
  };

  sendGeneralAnnouncementToAll = async (
    request: Request,
    response: Response
  ) => {
    let { message } = request.body;
    const userRepository = getRepository(User);
    const allUserEmails = await userRepository
      .createQueryBuilder("users")
      .select("users.email")
      .getMany();

    const allEmails = allUserEmails
      .map((user) => {
        return user.email;
      })
      .join(", ");

    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToAll = async (request: Request, response: Response) => {
    let { message } = request.body;
    const userRepository = getRepository(User);
    const allEmails = await userRepository
      .createQueryBuilder("users")
      .select(["users.email", "users.uid"])
      .getMany();

    allEmails.forEach(async (user) => {
      const parentDetails = await this.getParentPage(user.uid);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      console.log(myMessage);
      await publishMessage({ ...myMessage, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };

  sendGeneralAnnouncementToUsersFromSchool = async (
    request: Request,
    response: Response
  ) => {
    let { message, school } = request.body;
    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.name = :name", { name: school }) // TODO: change to unique name
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (schoolSelect == undefined) {
      response.status(401).send("School doesn't exist");
      return;
    }

    const emailSet: Set<string> = new Set();
    schoolSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        emailSet.add(s.parentUser.email);
      }
    });
    const allEmails = Array.from(emailSet).join(", ");
    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToUsersFromSchool = async (
    request: Request,
    response: Response
  ) => {
    let { message, school } = request.body;
    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.name = :name", { name: school }) // TODO: change to unique name
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (schoolSelect == undefined) {
      response.status(401).send("School doesn't exist");
      return;
    }

    const userSet: Set<User> = new Set();
    schoolSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        userSet.add(s.parentUser);
      }
    });

    userSet.forEach(async (user) => {
      const parentDetails = await this.getParentPage(user.uid);
      console.log(parentDetails);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      console.log(myMessage);
      await publishMessage({ ...myMessage, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };

  sendGeneralAnnouncementToUsersOnRoute = async (
    request: Request,
    response: Response
  ) => {
    let { message, routeId } = request.body;

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid: routeId })
      .leftJoinAndSelect("routes.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (routeSelect == undefined) {
      response.status(401).send("Route doesn't exist");
      return;
    }

    const emailSet: Set<string> = new Set();
    routeSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        emailSet.add(s.parentUser.email);
      }
    });

    const allEmails = Array.from(emailSet).join(", ");
    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToUsersOnRoute = async (
    request: Request,
    response: Response
  ) => {
    let { message, routeId } = request.body;

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid: routeId })
      .leftJoinAndSelect("routes.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (routeSelect == undefined) {
      response.status(401).send("Route doesn't exist");
      return;
    }

    const userSet: Set<User> = new Set();
    routeSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        userSet.add(s.parentUser);
      }
    });

    userSet.forEach(async (user) => {
      const parentDetails = await this.getParentPage(user.uid);
      console.log(parentDetails);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      console.log(myMessage);
      await publishMessage({ ...myMessage, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };
}