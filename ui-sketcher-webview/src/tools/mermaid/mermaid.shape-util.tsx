import {
  BaseBoxShapeUtil,
  Editor,
  HTMLContainer,
  SvgExportContext,
  TLBaseShape,
  useIsEditing,
} from "@tldraw/tldraw";
import { useBoxShadow } from "../use-box-shadow.hook";

import mermaid from "mermaid";
import { useEffect, useLayoutEffect, useRef } from "react";
import { mermaidConfig } from "./mermaid.config";

mermaid.initialize(mermaidConfig);

export type MermaidShape = TLBaseShape<
  "mermaid",
  {
    source: string;
    w: number;
    h: number;
  }
>;

export class MermaidShapeUtil extends BaseBoxShapeUtil<MermaidShape> {
  static override type = "mermaid" as const;

  getDefaultProps(): MermaidShape["props"] {
    return {
      source: "",
      w: (200 * 2) / 3,
      h: (300 * 2) / 3,
    };
  }

  override canEdit = () => true;
  override isAspectRatioLocked = (_shape: MermaidShape) => false;
  override canResize = (_shape: MermaidShape) => false;
  override canBind = (_shape: MermaidShape) => false;
  override canUnmount = () => true;
  override toSvg(
    _shape: MermaidShape,
    _ctx: SvgExportContext,
  ): SVGElement | Promise<SVGElement> {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    return g;
  }

  constructor(editor: Editor) {
    super(editor);
  }

  override component(shape: MermaidShape) {
    const diagramRef = useRef<HTMLDivElement>(null);
    const boxShadow = useBoxShadow(this.editor, shape);
    const isEditing = useIsEditing(shape.id);
    const mermaidDivId = `mermaid-${shape.id.replace(":", "-")}`;

    const { source } = shape.props;

    useEffect(() => {
      (async () => {
        if (isEditing || !diagramRef.current) return;
        console.debug("rendering mermaid", source);
        await mermaid.run({
          nodes: [diagramRef.current],
        });
        const svg = diagramRef.current.querySelector("svg");
        if (!svg) return;
        this.editor.updateShape({
          id: shape.id,
          type: "mermaid",
          props: {
            w: diagramRef.current.offsetWidth,
            h: diagramRef.current.offsetHeight,
          },
        });
      })();
    }, [source, isEditing, shape.id]);

    return (
      <HTMLContainer
        className="tl-mermaid-container"
        id={shape.id}
        style={{ boxShadow }}
      >
        <div ref={diagramRef} className="mermaid " id={mermaidDivId}>
          {source}
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: MermaidShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
