let storedData = {
  projects: [],
  campaigns: [],
  timelineRows: [],
  calendarEvents: [],
  systemPrompt: ""
};

function upsertProjects(existing, incoming) {
  const map = new Map(existing.map(p => [p.name, p]));

  for (const item of incoming) {
    if (item.action === "update" && map.has(item.name)) {
      map.set(item.name, {
        ...map.get(item.name),
        ...item
      });
    } else if (item.action === "new") {
      if (!map.has(item.name)) {
        map.set(item.name, item);
      }
    }
  }

  return Array.from(map.values());
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    console.log("Received from Make:", data);

    // 🔥 merge instead of overwrite
    storedData.projects = upsertProjects(
      storedData.projects,
      data.projects || []
    );

    // opcional: pode fazer o mesmo pra campaigns depois

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    return res.status(200).json(storedData);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
