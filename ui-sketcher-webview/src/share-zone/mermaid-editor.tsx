import { useEditor, ShapeUtil, TLUnknownShape } from "@tldraw/editor";
import { useEffect, useState } from "react";
import {
  MermaidShape,
  MermaidShapeUtil,
} from "../tools/mermaid/mermaid.shape-util";

const useSingleSelectedShape = <
  S extends TLUnknownShape,
  U extends typeof ShapeUtil<S> = typeof ShapeUtil<S>,
>(
  Shape: U,
): S | null => {
  const editor = useEditor();
  const [shape, setShape] = useState<null | S>(null);

  useEffect(() => {
    const onEvent = () => {
      const selectedShapes = editor.getSelectedShapes();
      if (
        selectedShapes.length === 1 &&
        selectedShapes[0].type === Shape.type
      ) {
        setShape(selectedShapes[0] as S);
      } else {
        setShape(null);
      }
    };

    editor.addListener("update", onEvent);

    return () => {
      editor.removeListener("event", onEvent);
    };
  }, [editor, setShape, Shape.type]);

  return shape;
};

export const MermaidEditor = () => {
  const editor = useEditor();
  const mermaidShape = useSingleSelectedShape<MermaidShape>(MermaidShapeUtil);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(mermaidShape ? mermaidShape.props.source : "");
  }, [mermaidShape]);

  if (!mermaidShape) return null;

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    editor.updateShape({
      id: mermaidShape.id,
      type: mermaidShape.type,
      props: { source: e.target.value },
    });
  };

  return (
    <div className="shadow-tl-2 m-w-1/2 pointer-events-auto rounded-lg p-3">
      <textarea
        className="textarea rounded-none"
        rows={12}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
