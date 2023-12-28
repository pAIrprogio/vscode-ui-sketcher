import { Editor, TLBaseShape, Vec2d, useValue } from "@tldraw/tldraw";

export const useBoxShadow = (editor: Editor, shape: TLBaseShape<string, object>) => useValue(
  "box shadow",
  () => {
    const rotation = editor.getShapePageTransform(shape)!.rotation();
    return getRotatedBoxShadow(rotation);
  },
  [editor, shape],
);

const ROTATING_BOX_SHADOWS = [
  {
    offsetX: 0,
    offsetY: 2,
    blur: 4,
    spread: -1,
    color: "#0000003a",
  },
  {
    offsetX: 0,
    offsetY: 3,
    blur: 12,
    spread: -2,
    color: "#0000001f",
  },
];

function getRotatedBoxShadow(rotation: number) {
  const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
    const { offsetX, offsetY, blur, spread, color } = shadow;
    const vec = new Vec2d(offsetX, offsetY);
    const { x, y } = vec.rot(-rotation);
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  });
  return cssStrings.join(", ");
}