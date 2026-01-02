export async function fetchAvatarUrl(steamId: string): string | null {
  // use Steam's avatar service to get the avatar URL

  const key = process.env.STEAM_API_KEY;

  if (!key) {
    return null;
  }

  const url =
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries" +
    `/v0002/?key=${key}&steamids=${steamId}`;

  const data: {
    response: {
      players: Array<{
        avatar: string;
        avatarmedium: string;
        avatarfull: string;
      }>;
    };
  } = await $fetch(url);

  if (data.response.players.length === 0) {
    return null;
  }

  return data.response.players[0].avatarmedium;
}
