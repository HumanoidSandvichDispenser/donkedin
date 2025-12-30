/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class MatchesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Matches
   * Returns a paginated list of all matches, sorted from most to least recent.
   * @param clan1 Team ID of the blu team.
   * @param clan2 Team ID of the red team.
   * @param vs Team ID of either team.
   * @param scheduled If set to 1, returns matches that have yet to be played. If set to 0, returns matches that are over.
   * @param competition Limit your search to a specific competition. Expects a competition ID.
   * @param from UNIX timestamp that limits results to everything after the timestamp.
   * @param to UNIX timestamp that limits results to everything before the time.
   * @param division Name of the division in which the competition was played.
   * @param teamType Name of the type of team.
   * @param round Name of the current round.
   * @param stringArray players A list of ETF2L user ID's. Returns only matches in which any of the provided players participated.
   * @param contentType
   * @param accept
   * @returns any
   * @throws ApiError
   */
  public getMatches(
    clan1?: number,
    clan2?: number,
    vs?: number,
    scheduled?: number,
    competition?: number,
    from?: number,
    to?: number,
    division?: string,
    teamType?: string,
    round?: string,
    stringArray?: string,
    contentType?: string,
    accept?: string,
  ): CancelablePromise<{
    results?: Record<string, any>;
    status?: Record<string, any>;
  }> {
    return this.httpRequest.request({
      method: "GET",
      url: "/matches",
      headers: {
        "Content-Type": contentType,
        Accept: accept,
      },
      query: {
        clan1: clan1,
        clan2: clan2,
        vs: vs,
        scheduled: scheduled,
        competition: competition,
        from: from,
        to: to,
        division: division,
        team_type: teamType,
        round: round,
        "string[]": stringArray,
      },
    });
  }
  /**
   * Match details
   * Returns additional details about a match like the players who participated in it.
   * @param leagueMatchId The ID of the leagueMatch.
   * @param contentType
   * @param accept
   * @returns any
   * @throws ApiError
   */
  public getMatches1(
    leagueMatchId: number,
    contentType?: string,
    accept?: string,
  ): CancelablePromise<{
    match?: Record<string, any>;
    status?: Record<string, any>;
  }> {
    return this.httpRequest.request({
      method: "GET",
      url: "/matches/{leagueMatch_id}",
      path: {
        leagueMatch_id: leagueMatchId,
      },
      headers: {
        "Content-Type": contentType,
        Accept: accept,
      },
    });
  }
}
