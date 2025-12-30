export default defineTask({
  meta: {
    name: "fetchPlayersTeams",
    description: "Fetch players and teams from external sources",
  },
  run({ payload, context }) {
    console.log("Running fetchPlayersTeams task");
    return {
      result: "OK",
    };
  },
});
