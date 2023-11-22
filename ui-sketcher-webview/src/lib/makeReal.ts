import { Editor, getSvgAsImage } from "@tldraw/tldraw";
import { sendMessage } from "./messageBus";

export async function sendExport(
  editor: Editor,
  partialRenderEnabled: boolean
) {
  // TODO: clean this up, partialRenderEnabled shouldn't be passed in
  let selectedShapes = partialRenderEnabled ? editor.getSelectedShapes() : [];

  if (selectedShapes.length === 0)
    selectedShapes = editor.getCurrentPageShapes();

  const svg = await editor.getSvg(selectedShapes);
  if (!svg) throw Error(`Could not get the SVG.`);

  const blob = await getSvgAsImage(svg, false, {
    type: "png",
    quality: 1,
    scale: 1,
  });

  const base64 = await blobToBase64(blob!);
  const imageTexts = getSelectionAsText(editor);

  await sendMessage({
    command: "tldraw:export",
    payload: { base64, imageTexts },
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function getSelectionAsText(editor: Editor) {
  let selectedShapeIds = editor.getSelectedShapeIds();

  if (selectedShapeIds.length === 0)
    selectedShapeIds = Array.from(editor.getCurrentPageShapeIds());

  const selectedShapeDescendantIds =
    editor.getShapeAndDescendantIds(selectedShapeIds);

  const texts = Array.from(selectedShapeDescendantIds)
    .map((id) => {
      const shape = editor.getShape(id);
      if (!shape) return null;
      if (
        shape.type === "text" ||
        shape.type === "geo" ||
        shape.type === "arrow" ||
        shape.type === "note"
      ) {
        // @ts-expect-error
        return shape.props.text;
      }
      return null;
    })
    .filter((v) => v !== null && v !== "");

  return texts.join("\n");
}
