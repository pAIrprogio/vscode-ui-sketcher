import { MakeRealButton } from "./make-real-button";
import { MermaidEditor } from "./mermaid-editor";

export const ShareZone = () => {
  return (
    <div className="z-300 flex flex-col gap-2 p-2">
      <div className="flex justify-end gap-2">
        <MakeRealButton />
      </div>
      <MermaidEditor />
    </div>
  );
};
