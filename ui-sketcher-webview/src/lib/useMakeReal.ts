import "@tldraw/tldraw/tldraw.css";
import { useState } from "react";

export const useMakeReal = () => {
  const [partialRenderEnabled] = useState(window.partialRenderEnabled || false);
  const [persistanceKey] = useState(window.workspaceId);

  return {
    partialRenderEnabled,
    persistanceKey,
  };
};

export type MakeRealStore = ReturnType<typeof useMakeReal>;
