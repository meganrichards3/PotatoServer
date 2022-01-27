import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Route } from "../entity/Route";

@EntityRepository(Route)
export class RouteController extends Repository<Route> {
  private routeRepository = getRepository(Route);

  async allRoutes(request: Request, response: Response, next: NextFunction) {
    try {

      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "routes.uid";
      }
      else { //should error check instead of else
        sortSpecification = "routes." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }
  async filterAllRoutes(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "route.uid";
      }
      else { //should error check instead of else
        sortSpecification = "route." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      var filterSpecification;
      filterSpecification = "route." + request.params.sort;
      const queryFilterType = request.params.filterType;
      const queryFilterData = request.params.filterData;
      const routeQueryResult = await this.routeRepository.createQueryBuilder("route").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).having("route." + queryFilterType + " = :spec", { spec: queryFilterData }).groupBy("route.uid").getMany();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }

  async oneRoute(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").where("routes.uid = :uid", { uid: uidNumber }).getOneOrFail();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response
        .status(401)
        .send("Route with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewRoute(request: Request, response: Response, next: NextFunction) {
    try {
      return this.routeRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New Route (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateRoute(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      await getConnection().createQueryBuilder().update(Route).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
    }

    catch (e) {
      response
        .status(401)
        .send("Route with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteRoute(request: Request, response: Response, next: NextFunction) {
    try {

      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").delete().where("routes.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);

    }
    catch (e) {
      response.status(401).send("Route UID: " + request.params.uid + " was not found adn could not be deleted.")
    }
  }
  findByRouteID(uid: number) {
    return this.createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid })
      .getOne();
  }
}
