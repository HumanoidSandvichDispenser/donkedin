import { describe, it, expect, vi, beforeEach } from "vitest";
import { RglClient } from "../../clients/rgl/RglClient";
import RglService from "../../services/rgl-service";
import { createStrictRepositoryMock } from "../utils/strictMock";

const mockClient = Object.assign(new RglClient(), {
  profile: {
    getV0Profile: vi.fn(),
    getV0ProfileTeams: vi.fn(),
  }
});

let client = mockClient;

describe("rgl-service", () => {
  beforeEach(() => {
    client = mockClient;
  });

  it("should return null when API returns null", async () => {
    client.profile.getV0Profile = vi.fn().mockRejectedValue(null);
    const repository = createStrictRepositoryMock();

    const service = new RglService(client, repository);

    const result = await service.fetchRglPlayerFromApi("id");

    expect(result).toBeNull();
  });
});
