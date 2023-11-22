import { Editor, Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { ExportButton } from "./ExportButton";
import { PreviewShapeUtil } from "./PreviewShape";
import { MakeRealStore, useMakeReal } from "./lib/useMakeReal";

const shapeUtils = [PreviewShapeUtil];

const onMount = (
  editor: Editor,
  { displayPreviewOnStart, displayPreview }: MakeRealStore
) => {
  if (displayPreviewOnStart) displayPreview(editor);
};

export const App = () => {
  // TODO: use editor persistence per file
  const makeReal = useMakeReal();

  return (
    <div className={`w-screen h-screen`}>
      <Tldraw
        persistenceKey={makeReal.persistanceKey}
        shapeUtils={shapeUtils}
        shareZone={<ExportButton />}
        onMount={(editor) => onMount(editor, makeReal)}
      />
    </div>
  );
};
