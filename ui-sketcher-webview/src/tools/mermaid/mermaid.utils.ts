const mermaidTypes = ["flowchart", "sequenceDiagram", "gantt", "classDiagram", "stateDiagram-v2", "pie", "gantt", "journey", "C4Context"]

export const isMermaid = (code: string) => {
  const firstWord = code.trimStart().split(/[\s\n]/)?.[0];

  if (!firstWord) return false;

  return mermaidTypes.some(type => firstWord === type);
}