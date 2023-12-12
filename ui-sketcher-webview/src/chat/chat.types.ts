interface RunningToolStep {
  type: 'tools';
  status: 'running';
  tools: Array<{
    name: string;
    args: object;
  }>;
}

interface DoneToolStep {
  type: 'tools';
  status: 'done';
  tools: Array<{
    status: "success" | "error";
    name: string;
    args: object;
    output: any;
  }>;
}

type ToolStep = RunningToolStep | DoneToolStep;

interface MessageStep {
  type: 'message';
  content: string;
}

type Step = ToolStep | MessageStep;

interface SystemMessage {
  role: 'system';
  steps: Array<Step>;
}

interface UserMessage {
  role: 'user';
  content: string;
}

type Message = SystemMessage | UserMessage;