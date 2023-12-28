import { never } from "../ts.utils";
import { SystemMessage } from "./chat.types";
import {
  InfoCircleFill,
  CheckCircleFill,
  ExclamationCircleFill,
} from "react-bootstrap-icons";

export const StateIndicator = ({
  state,
}: {
  state: SystemMessage["state"];
}) => {
  switch (state) {
    case "thinking":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-slate-300 px-2 py-1">
          <span className="loading loading-dots loading-sm"></span>
          <span>Thinking</span>
        </div>
      );
    case "cancelled":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-error px-2 py-1 text-error">
          <InfoCircleFill />
          <span>Cancelled</span>
        </div>
      );
    case "cancelling":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-warning px-2 py-1 text-warning">
          <span className="loading loading-dots loading-sm"></span>
          <span>Cancelling</span>
        </div>
      );
    case "done":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-success px-2 py-1 text-success">
          <CheckCircleFill />
          <span>Done</span>
        </div>
      );
    case "expired":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-error px-2 py-1 text-error">
          <ExclamationCircleFill />
          <span>Expired</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex w-fit items-center gap-2 rounded-sm bg-error px-2 py-1 text-error">
          <ExclamationCircleFill />
          <span>Failed</span>
        </div>
      );
    default:
      never(state);
  }
};
