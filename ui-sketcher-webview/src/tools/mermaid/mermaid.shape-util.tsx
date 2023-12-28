import {
  BaseBoxShapeUtil,
  Editor,
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  SvgExportContext,
  TLBaseShape,
  TLUnknownShape,
  useIsEditing,
} from "@tldraw/tldraw";
import { useBoxShadow } from "../use-box-shadow.hook";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { mermaidConfig } from "./mermaid.config";
import { SourceStyleProp } from "../style-props";
import { T } from "@tldraw/validate";

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
  static override type = "mermaid" as const satisfies string;

  svgNode: SVGElement | null = null;

  getDefaultProps(): MermaidShape["props"] {
    return {
      source: "",
      w: (200 * 2) / 3,
      h: (300 * 2) / 3,
    };
  }

  static override props = {
    source: SourceStyleProp,
    w: T.number,
    h: T.number,
  };

  override canEdit = () => true;
  override isAspectRatioLocked = (_shape: TLUnknownShape) => false;
  override canResize = (_shape: TLUnknownShape) => false;
  override canBind = (_shape: TLUnknownShape) => true;
  override canUnmount = () => true;
  override canSnap = (_shape: TLUnknownShape) => true;

  override getGeometry(shape: MermaidShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override toSvg(
    _shape: MermaidShape,
    _ctx: SvgExportContext,
  ): SVGElement | Promise<SVGElement> {
    if (!this.svgNode)
      return document.createElementNS("http://www.w3.org/2000/svg", "g");

    return this.svgNode.cloneNode(true) as SVGElement;
  }

  constructor(editor: Editor) {
    super(editor);
  }

  override component(shape: MermaidShape) {
    const renderOnce = useRef(false);
    const diagramRef = useRef<HTMLDivElement>(null);
    const boxShadow = useBoxShadow(this.editor, shape);
    const isEditing = useIsEditing(shape.id);
    const mermaidDivId = `mermaid-${shape.id.replace(":", "-")}`;
    const [svg, setSvg] = useState<null | string>(null);

    const { source } = shape.props;

    // Render mermaid diagram
    useEffect(() => {
      (async () => {
        if (isEditing || !diagramRef.current) return;

        // This is a hack to get arround https://github.com/mermaid-js/mermaid/issues/2651
        if (!renderOnce.current) {
          renderOnce.current = true;
          await mermaid.render(mermaidDivId, source);
          await new Promise((resolve) => setTimeout(resolve, 1));
        }

        const { svg: renderedSvg } = await mermaid.render(mermaidDivId, source);

        setSvg(renderedSvg);
      })();
    }, [source, isEditing, shape.id, setSvg, mermaidDivId]);

    // Resize bounding box to fit diagram & update svg node ref
    useEffect(() => {
      if (!diagramRef.current) return;

      const current = diagramRef.current;

      const onResize = () => {
        if (
          current.offsetWidth !== shape.props.w ||
          current.offsetHeight !== shape.props.h
        ) {
          this.editor.updateShape({
            id: shape.id,
            type: shape.type,
            props: {
              w: current.offsetWidth,
              h: current.offsetHeight,
            },
          });
        }

        const svgNode = diagramRef.current?.querySelector("svg");
        if (svgNode) this.svgNode = svgNode;
      };

      const observer = new ResizeObserver(onResize);
      observer.observe(current);
      return () => {
        observer.unobserve(current);
        observer.disconnect();
      };
    }, [diagramRef, shape.props.w, shape.props.h, shape.id, shape.type]);

    return (
      <HTMLContainer
        className="tl-mermaid-container"
        id={shape.id}
        style={{ boxShadow }}
      >
        <div
          ref={diagramRef}
          className="mermaid"
          dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        ></div>
      </HTMLContainer>
    );
  }

  indicator(shape: MermaidShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
