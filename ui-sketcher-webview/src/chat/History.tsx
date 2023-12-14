import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownCircleFill } from "react-bootstrap-icons";
import RMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { ToolsStep } from "./ToolsStep";
import { Message } from "./chat.types";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const History = ({ history }: { history: Message[] }) => {
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
  }, [scrollToBottom]);

  // Scroll to bottom when history changes
  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  return (
    <div
      className="scroll relative flex flex-1 flex-col overflow-y-scroll bg-white px-3"
      onScroll={onScroll}
      ref={scrollRef}
    >
      {history.map((item, index) => {
        switch (item.role) {
          case "system":
            return (
              <div key={index} className="pt-4 text-lg font-bold">
                <div className="sticky top-0 flex items-center gap-2 bg-white">
                  <div className="text-l text-primary">Assistant</div>
                  <div className="flex-1 border-b-2" />
                </div>
                <div className="flex flex-col gap-2">
                  {item.steps.map((step, i) => {
                    switch (step.type) {
                      case "tools":
                        return <ToolsStep key={i} step={step} index={i} />;
                      case "message":
                        return (
                          <div key={i} className="flex flex-col gap-2">
                            <span className="font-bold">{i + 1}. Response</span>
                            <div key={i} className="prose p-2">
                              <Mardown>{step.content}</Mardown>
                            </div>
                          </div>
                        );
                    }
                  })}
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
                  <Mardown>{item.content}</Mardown>
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
