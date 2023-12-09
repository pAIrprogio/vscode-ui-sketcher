import { Editor, getSvgAsImage } from "@tldraw/tldraw";

export async function extractImageAndText(editor: Editor, selectionOnly: boolean) {
  const [base64, text] = await Promise.all([
    extractImage(editor, selectionOnly),
    extractText(editor, selectionOnly),
  ]);
  return { base64, text };
}

export async function extractImage(
  editor: Editor,
  selectionOnly: boolean
) {
  // TODO: clean this up, partialRenderEnabled shouldn't be passed in
  const selectedShapes = selectionOnly ? editor.getSelectedShapes() : editor.getCurrentPageShapes();

  const svg = await editor.getSvg(selectedShapes);
  if (!svg) throw Error(`Could not get the SVG.`);

  const blob = await getSvgAsImage(svg, false, {
    type: "png",
    quality: 1,
    scale: 1,
  });

  const base64 = await blobToBase64(blob!);

  return base64;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function extractText(editor: Editor, selectionOnly: boolean) {
  const selectedShapeIds = selectionOnly ? editor.getSelectedShapeIds() : Array.from(editor.getCurrentPageShapeIds());

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
