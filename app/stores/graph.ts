import { defineStore } from "pinia";
import { ref } from "vue";

function makeNodeId(n: { type: string; id: string }) {
  return `${n.type}:${n.id}`;
}

export const useGraphStore = defineStore("graph", () => {
  const nodes = ref<Array<any>>([]);
  const links = ref<Array<any>>([]);
  const pathInfo = ref<any>(null);

  function clear() {
    nodes.value = [];
    links.value = [];
    pathInfo.value = null;
  }

  function addNodeIfMissing(node: any) {
    const id = makeNodeId(node);
    if (!nodes.value.find((n) => makeNodeId(n) === id)) {
      nodes.value.push({ ...node });
    }
  }

  function removeNodeById(nodeId: string) {
    nodes.value = nodes.value.filter((n) => makeNodeId(n) != nodeId);
  }

  function addEdgeIfMissing(source: any, target: any, weight = 1) {
    const sid = makeNodeId(source);
    const tid = makeNodeId(target);
    const edgeId = `e:${sid}->${tid}`;
    if (!links.value.find((e) => e.id === edgeId)) {
      links.value.push({ id: edgeId, source: sid, target: tid, weight });
    }
  }

  async function expandNodeById(id: string, type: string) {
    try {
      if (type === "player") {
        const res = await $fetch(`/api/player/id/${id}`);

        const playerNode = {
          id: res.player.id,
          name: res.player.rglName || res.player.etf2lName || res.player.id,
          type: "player",
        };

        addNodeIfMissing(playerNode);

        const teams = res.teams || {};

        for (const t of teams.rgl || []) {
          const teamNode = { id: t.id, name: t.name, type: "rgl" };
          addNodeIfMissing(teamNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }

        for (const t of teams.etf2l || []) {
          const teamNode = { id: t.id, name: t.name, type: "etf2l" };
          addNodeIfMissing(teamNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }
      } else if (type === "rgl") {
        const res = await $fetch(`/api/team/rgl/id/${id}`);
        const team = res.team;
        const teamNode = { id: team.id, name: team.name, type: "rgl" };
        addNodeIfMissing(teamNode);

        for (const p of res.players || []) {
          const playerNode = { id: p.id, name: p.name, type: "player" };
          addNodeIfMissing(playerNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }
      } else if (type === "etf2l") {
        const res = await $fetch(`/api/team/etf2l/id/${id}`);
        const team = res.team;
        const teamNode = { id: team.id, name: team.name, type: "etf2l" };
        addNodeIfMissing(teamNode);
        for (const p of res.players || []) {
          const playerNode = { id: p.id, name: p.name, type: "player" };
          addNodeIfMissing(playerNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }
      }
    } catch (err) {
      console.error("Expand node failed", err);
    }
  }

  async function loadSourceOnly(steamId: string) {
    steamId = steamId.trim();
    if (/^\d+$/.test(steamId)) {
      try {
        const res = await $fetch(`/api/player/id/${steamId}`);
        const playerNode = {
          id: res.player.id,
          name: res.player.rglName || res.player.etf2lName || res.player.id,
          type: "player",
        };
        addNodeIfMissing(playerNode);
        const teams = res.teams || {};
        for (const t of teams.rgl || []) {
          const teamNode = { id: t.id, name: t.name, type: "rgl" };
          addNodeIfMissing(teamNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }
        for (const t of teams.etf2l || []) {
          const teamNode = { id: t.id, name: t.name, type: "etf2l" };
          addNodeIfMissing(teamNode);
          addEdgeIfMissing(playerNode, teamNode, 1);
        }
        return;
      } catch (e) {
        console.error("Load source failed", e);
      }
    }
  }

  async function loadPath(a: string, b: string) {
    if (!a || !b) {
      return;
    }

    const params = new URLSearchParams();
    params.set("a", a.trim());
    params.set("b", b.trim());

    try {
      const res = await $fetch(`/api/player/path?${params.toString()}`);

      if (res.nodes.length == 0) {
        return;
      }

      // add nodes
      for (const n of res.nodes) {
        let type = "player";
        if (n.labels && Array.isArray(n.labels)) {
          if (n.labels.includes("RglTeam")) {
            type = "rgl";
          } else if (n.labels.includes("Etf2lTeam")) {
            type = "etf2l";
          } else if (n.labels.includes("Player")) {
            type = "player";
          }
        }

        const node = {
          id: n.properties?.id ?? n.id,
          name:
            n.properties?.rglName ??
            n.properties?.etf2lName ??
            n.properties?.name ??
            n.properties?.label ??
            String(n.id),
          type,
        };
        addNodeIfMissing(node);
      }

      // add edges from segments
      if (Array.isArray(res.segments)) {
        for (const s of res.segments) {
          const start = s.start;
          const end = s.end;
          const startType = (start.labels || []).includes("RglTeam")
            ? "rgl"
            : (start.labels || []).includes("Etf2lTeam")
              ? "etf2l"
              : "player";
          const endType = (end.labels || []).includes("RglTeam")
            ? "rgl"
            : (end.labels || []).includes("Etf2lTeam")
              ? "etf2l"
              : "player";
          const startNode = {
            id: start.properties?.id ?? start.id,
            name:
              start.properties?.rglName ??
              start.properties?.etf2lName ??
              start.properties?.name ??
              String(start.id),
            type: startType,
          };
          const endNode = {
            id: end.properties?.id ?? end.id,
            name:
              end.properties?.rglName ??
              end.properties?.etf2lName ??
              end.properties?.name ??
              String(end.id),
            type: endType,
          };
          addNodeIfMissing(startNode);
          addNodeIfMissing(endNode);
          addEdgeIfMissing(startNode, endNode, 1);
        }
      }

      pathInfo.value = res;
    } catch (e) {
      console.error("Path load failed", e);
    }
  }

  const selectedNode = ref<any | null>(null);

  function selectNode(node: any) {
    if (!node) {
      selectedNode.value = null;
      return;
    }

    const raw = node.raw ?? node;
    const props = raw.properties || {};

    const id = String(node.id ?? props.id ?? raw.id ?? "");
    const type =
      node.type ??
      raw.type ??
      (props.rglName || props.etf2lName ? "player" : "player");
    const name =
      node.name ??
      props.rglName ??
      props.etf2lName ??
      props.name ??
      props.label ??
      String(raw.id ?? "");

    selectedNode.value = {
      id,
      type,
      name,
      raw,
    };
  }

  return {
    nodes,
    links,
    pathInfo,
    clear,
    addNodeIfMissing,
    addEdgeIfMissing,
    expandNodeById,
    removeNodeById,
    loadSourceOnly,
    loadPath,
    selectedNode,
    selectNode,
  };
});
