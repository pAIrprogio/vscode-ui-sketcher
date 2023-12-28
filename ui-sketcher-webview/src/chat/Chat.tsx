import {
  FormEvent,
  KeyboardEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpSquareFill } from "react-bootstrap-icons";
import { useAssistant } from "./use-assistant";
import { History } from "./History";

interface InputProps {
  onSubmit: (message: string) => void;
}

const Input = ({ onSubmit }: InputProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const isEmpty = message.trim().length === 0;

  const forwardSubmit = (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    onSubmit(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      forwardSubmit(e);
    }
  };

  useEffect(() => {
    if (ref.current) {
      // Find a way to make this cleaner, up to 5 lines
      if (ref.current.scrollHeight / 32 < 5) {
        ref.current.style.height = "auto";
        ref.current.style.height = ref.current.scrollHeight + "px";
      }
    }
  }, [message]);

  return (
    <form onSubmit={forwardSubmit} className="relative">
      <button
        type="submit"
        className="absolute bottom-4 right-2 opacity-60 hover:opacity-100 disabled:hidden"
        disabled={isEmpty}
      >
        <ArrowUpSquareFill size="2rem" />
      </button>

      <textarea
        name="message"
        ref={ref}
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        className="textarea textarea-primary w-full rounded-none bg-white pr-14"
        placeholder="Message your assistant..."
        onKeyDown={handleKeyDown}
        rows={1}
        style={{ resize: "none" }}
      ></textarea>
    </form>
  );
};

export const Chat = () => (
  <Suspense fallback={<span>waiting...</span>}>
    <ChatSuspense />
  </Suspense>
);

const ChatSuspense = () => {
  const state = useAssistant();

  return (
    <div className="flex h-full max-h-full flex-col gap-3 bg-white">
      <History history={state.history} />
      <Input onSubmit={state.sendMessage} />
    </div>
  );
};
