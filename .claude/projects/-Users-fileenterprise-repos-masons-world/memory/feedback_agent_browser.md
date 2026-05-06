---
name: agent-browser is a Skill, not an Agent subagent_type
description: How to correctly invoke agent-browser for screenshots and browser automation
type: feedback
---

Use the `Skill` tool to invoke agent-browser — NOT the `Agent` tool with `subagent_type: "agent-browser"`. That will always 404.

**Why:** agent-browser is listed in the available skills (system-reminder), not in the Agent subagent registry. Confusing the two silently fails.

**How to apply:** Any time a skill (ship-experiment, agent-browser, etc.) calls for browser automation or screenshots, invoke via:
```
Skill({ skill: "agent-browser", args: "..." })
```
Not via Agent().
