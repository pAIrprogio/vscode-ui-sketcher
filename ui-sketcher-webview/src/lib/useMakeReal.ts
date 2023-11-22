import { Editor, createShapeId } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useCallback, useState } from "react";
import { displayPreviewShape } from "../PreviewShape";
import { sendExport } from "./makeReal";

export const useMakeReal = () => {
  const [previewShapeId] = useState(() => createShapeId("preview-frame"));
  const [partialRenderEnabled] = useState(window.partialRenderEnabled || false);

  const [previewUrl] = useState(
    window.previewUrl && window.previewUrl + "?filePath=" + window.relativePath
  );
  const isPreviewEnabled = !!previewUrl;
  const [displayPreviewOnStart] = useState(
    window.displayPreviewOnStart || false
  );

  const [persistanceKey] = useState(window.relativePath);

  const displayPreview = useCallback(
    (editor: Editor) => {
      if (!isPreviewEnabled) return;
      displayPreviewShape(editor, previewShapeId, previewUrl);
    },
    [previewShapeId, previewUrl, isPreviewEnabled]
  );

  const makeReal = useCallback(
    async (editor: Editor) => {
      await sendExport(editor, partialRenderEnabled);
      displayPreview(editor);
    },
    [displayPreview, partialRenderEnabled]
  );

  return {
    partialRenderEnabled,
    displayPreviewOnStart,
    displayPreview,
    makeReal,
    persistanceKey,
    previewShapeId,
  };
};

export type MakeRealStore = ReturnType<typeof useMakeReal>;
