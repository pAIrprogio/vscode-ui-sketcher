import { ToolStep } from "./chat.types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

interface ToolsStepProps {
  step: ToolStep;
  index: number;
}

export const ToolsStep = ({ step, index }: ToolsStepProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 align-middle">
        <span className="font-bold">{index + 1}. Executing tools</span>
        {step.status === "running" ? (
          <span className="loading loading-bars loading-sm" />
        ) : null}
      </div>
      <div className="join join-vertical w-full">
        {step.tools.map((tool, ti) => (
          <Tool key={tool.id} tool={tool} index={ti} />
        ))}
      </div>
    </div>
  );
};

const Tool = ({
  tool,
  index,
}: {
  tool: ToolStep["tools"][0];
  index: number;
}) => {
  const backgroundColor =
    tool.status === "success"
      ? "bg-success"
      : tool.status === "error"
      ? "bg-error"
      : "bg-base-200";

  return (
    <div
      tabIndex={index}
      className={`collapse join-item collapse-arrow border border-base-300 ${backgroundColor}`}
    >
      <div className="collapse-title flex min-h-0 items-center gap-2 p-2 font-medium">
        {tool.status === "success" ? (
          <CheckCircle />
        ) : tool.status === "error" ? (
          <XCircle />
        ) : (
          <span className="loading loading-spinner loading-xs" />
        )}
        <span>{tool.name}</span>
      </div>
      <div className="collapse-content text-sm">
        <div className="flex flex-col gap-2 text-justify">
          <SyntaxHighlighter language="json" style={a11yDark}>
            {"// Args:\n" + JSON.stringify(tool.args, null, 2)}
          </SyntaxHighlighter>
        </div>
        {tool.output && (
          <div className="flex flex-col gap-2 text-justify">
            <SyntaxHighlighter language="json" style={a11yDark}>
              {"// Output:\n" + JSON.stringify(tool.output, null, 2)}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};
