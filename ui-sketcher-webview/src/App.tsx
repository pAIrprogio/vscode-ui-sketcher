import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useMakeReal } from "./lib/useMakeReal";
import { shapeUtils } from "./shapes-utils";
import { ShareZone } from "./share-zone/share-zone";

export const App = () => {
  // TODO: use editor persistence per file
  const makeReal = useMakeReal();

  return (
    <div className={`h-screen w-screen`}>
      <Tldraw
        persistenceKey={makeReal.persistanceKey}
        shapeUtils={shapeUtils}
        shareZone={<ShareZone />}
      />
    </div>
  );
};
