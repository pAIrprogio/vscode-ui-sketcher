export interface RunningToolStep {
  type: "tools";
  status: "running";
  tools: Array<{
    id: string;
    name: string;
    args: object;
    status?: undefined;
    output?: undefined;
  }>;
}

export interface DoneToolStep {
  type: "tools";
  status: "done";
  tools: Array<{
    id: string;
    status: "success" | "error";
    name: string;
    args: object;
    output: any;
  }>;
}

export type ToolStep = RunningToolStep | DoneToolStep;

export interface MessageStep {
  type: "message";
  content: string;
}

export type Step = ToolStep | MessageStep;

export interface SystemMessage {
  id: string;
  role: "system";
  state:
    | "thinking"
    | "done"
    | "cancelling"
    | "cancelled"
    | "failed"
    | "expired";
  steps: Array<Step>;
}

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
}

export type Message = SystemMessage | UserMessage;
