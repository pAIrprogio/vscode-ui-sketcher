import "@tldraw/tldraw/tldraw.css";
import { Tldraw } from "@tldraw/tldraw";
import { ExportButton } from "./ExportButton";

export const App = () => {
  return (
    <div className={`w-screen h-screen`}>
      <Tldraw persistenceKey="tldraw">
        <ExportButton />
      </Tldraw>
    </div>
  );
};
