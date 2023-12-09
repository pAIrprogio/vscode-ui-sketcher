import { TLOnMountHandler, Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useSettings } from "./domain/use-settings";
import { shapeUtils } from "./shapes-utils";
import { ShareZone } from "./share-zone/share-zone";
import { isMermaid } from "./tools/mermaid/mermaid.utils";

const onMount: TLOnMountHandler = (editor) => {
  editor.registerExternalContentHandler("embed", async (_asset) => {
    alert("embed");
  });
  editor.registerExternalContentHandler("files", async (_asset) => {
    alert("files");
  });
  editor.registerExternalContentHandler("url", async (_asset) => {
    alert("url");
  });
  // editor.registerExternalContentHandler("svg-text", async (asset) => {
  //   alert("svg-text");
  // });
  editor.registerExternalContentHandler("text", async (asset) => {
    if (isMermaid(asset.text)) {
      console.debug("mermaid");
      editor.createShape({
        type: "mermaid",
        x: asset.point?.x,
        y: asset.point?.y,
        props: { source: asset.text },
      });
      return;
    }
    alert("text");
  });
};

export const App = () => {
  // TODO: use editor persistence per file
  const settings = useSettings();

  return (
    <div className={`h-screen w-screen`}>
      <Tldraw
        persistenceKey={settings.persistanceKey}
        shapeUtils={shapeUtils}
        shareZone={<ShareZone />}
        onMount={onMount}
      />
    </div>
  );
};
