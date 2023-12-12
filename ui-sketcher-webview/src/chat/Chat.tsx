import { proxy, useSnapshot } from "valtio";
import RMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownCircleFill } from "react-bootstrap-icons";

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
              <div key={index} className="border-b-2 py-4 text-lg font-bold">
                <div className="text-l sticky top-0 bg-white">Assistant:</div>
                <div className="prose p-2">
                  <Mardown>{item.message}</Mardown>
                </div>
              </div>
            );
          case "user":
            return (
              <div key={index} className="border-b-2 py-4 text-lg font-bold">
                <div className="sticky top-0 bg-white">You:</div>
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

const Input = () => {
  return (
    <form>
      <textarea
        className="textarea textarea-primary w-full rounded-none pl-5"
        placeholder="Bio"
      ></textarea>
      <span className="button"></span>
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
      <Input />
    </div>
  );
};
