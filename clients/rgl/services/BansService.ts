/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class BansService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * League bans
   * Paged endpoint for gathering league bans and associated information
   * @param take
   * @param skip
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0BansPaged(take?: number, skip?: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/bans/paged",
      query: {
        take: take,
        skip: skip,
      },
    });
  }
}
