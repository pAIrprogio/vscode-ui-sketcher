import { proxy, useSnapshot } from "valtio";
import RMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDownCircleFill, ArrowUpSquareFill } from "react-bootstrap-icons";

function useLocal<T extends object | undefined>(input: T) {
  return useRef(proxy(input)).current as T;
}

const history = proxy([
  {
    type: "system",
    message: `
# Hello World
This is a test

\`\`\`js
console.log("Hello World!");
return true;
\`\`\`
  
  `,
  },
  { type: "user", message: "Hi!" },
  { type: "system", message: "Hello!" },
  { type: "user", message: "Hi!" },
  { type: "system", message: "Hello!" },
  { type: "user", message: "Hi!" },
  { type: "system", message: "Hello!" },
  { type: "user", message: "Hi!" },
  { type: "system", message: "Hello!" },
  { type: "user", message: "Hi!" },
  { type: "system", message: "Hello!" },
  { type: "user", message: "Hi!" },
]);

const Mardown = ({ children }: { children: string }) => (
  <RMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code: Code,
    }}
  >
    {children}
  </RMarkdown>
);

const Code = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >,
) => {
  const { children, className, ref, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");

  if (!match) {
    return (
      <div className="p-3">
        <code {...rest}>{children}</code>
      </div>
    );
  }

  return (
    <div>
      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        customStyle={{ margin: 0 }}
        language={match[1]}
        style={a11yDark}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

const History = ({ history }: { history: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayScrollButton, setDisplayScrollButton] = useState(false);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop + element.clientHeight < element.scrollHeight) {
      setDisplayScrollButton(true);
    } else {
      setDisplayScrollButton(false);
    }
  };

  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "instant",
        });
      }
    },
    [scrollRef],
  );

  // Start at bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Scroll to bottom when history changes
  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  return (
    <div
      className="scroll relative flex flex-1 flex-col overflow-y-scroll px-3"
      onScroll={onScroll}
      ref={scrollRef}
    >
      {history.map((item, index) => {
        switch (item.type) {
          case "system":
            return (
              <div key={index} className="pt-4 text-lg font-bold">
                <div className="sticky top-0 flex items-center gap-2 bg-white">
                  <div className="text-l text-primary">Assistant</div>
                  <div className="flex-1 border-b-2" />
                </div>
                <div className="prose p-2">
                  <Mardown>{item.message}</Mardown>
                </div>
              </div>
            );
          case "user":
            return (
              <div key={index} className="pt-4 text-lg font-bold">
                <div className="sticky top-0 flex items-center gap-2 bg-white">
                  <div className="text-l text-secondary">You</div>
                  <div className="flex-1 border-b-2" />
                </div>
                <div className="prose p-2">
                  <Mardown>{item.message}</Mardown>
                </div>
              </div>
            );
        }
      })}
      {displayScrollButton && (
        <div className="sticky bottom-2 flex w-full justify-center ">
          <button
            onClick={() => scrollToBottom()}
            className="opacity-40 hover:opacity-100"
          >
            <ArrowDownCircleFill size="2rem" />
          </button>
        </div>
      )}
    </div>
  );
};

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

export const Chat = () => {
  const historySnap = useSnapshot(history);
  const [value] = useState("");

  const onSizeChange = (size: number) => {};

  return (
    <div className="flex h-full max-h-full flex-col gap-3 bg-white">
      <History history={historySnap} />
      <Input
        onSubmit={(data) => {
          console.warn(data);
        }}
      />
    </div>
  );
};
