import "@tldraw/tldraw/tldraw.css";
import { proxy, useSnapshot } from "valtio";

const settings = proxy({
  partialRenderEnabled: window.partialRenderEnabled || false,
  persistanceKey: window.workspaceId,
});

export const useSettings = () => useSnapshot(settings);
