"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bot, CheckCircle2, Send, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/lib/language";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function renderInline(str: string) {
  // Parses **bold** and *italic*
  const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

type SectionContent =
  | { type: "p"; text: string }
  | { type: "h4"; title: string }
  | { type: "list"; items: string[] }
  | { type: "math"; formula: string };

type SectionBlock = {
  title: string;
  content: SectionContent[];
};

function parseMarkdownToBlocks(text: string): SectionBlock[] {
  const lines = text.split("\n");
  const blocks: SectionBlock[] = [];
  let currentBlock: SectionBlock | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === "---") continue;

    const h3Match = line.match(/^#{1,3}\s+(.+)$/);
    const h4Match = line.match(/^#{4}\s+(.+)$/);
    const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
    const mathMatch = line.match(/^\$\$(.+)\$\$$/);

    if (h3Match) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { title: h3Match[1].trim(), content: [] };
    } else if (h4Match) {
      if (!currentBlock) currentBlock = { title: "", content: [] };
      currentBlock.content.push({ type: "h4", title: h4Match[1].trim() });
    } else if (mathMatch) {
      if (!currentBlock) currentBlock = { title: "", content: [] };
      currentBlock.content.push({ type: "math", formula: mathMatch[1].trim() });
    } else if (bulletMatch) {
      if (!currentBlock) currentBlock = { title: "", content: [] };
      const last = currentBlock.content[currentBlock.content.length - 1];
      if (last && last.type === "list") {
        last.items.push(bulletMatch[1].trim());
      } else {
        currentBlock.content.push({ type: "list", items: [bulletMatch[1].trim()] });
      }
    } else {
      if (!currentBlock) currentBlock = { title: "", content: [] };
      const last = currentBlock.content[currentBlock.content.length - 1];
      if (last && last.type === "p") {
        last.text += " " + line;
      } else {
        currentBlock.content.push({ type: "p", text: line });
      }
    }
  }

  if (currentBlock) blocks.push(currentBlock);
  return blocks;
}

function FormatMessageContent({ text }: { text: string }) {
  const blocks = parseMarkdownToBlocks(text);

  if (blocks.length === 0) {
    return <p className="leading-relaxed text-slate-800">{text}</p>;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, bIdx) => {
        const titleLower = block.title.toLowerCase();
        const isExec = titleLower.includes("executive");
        const isTelemetry = titleLower.includes("telemetry") || titleLower.includes("metric");
        const isCpi = titleLower.includes("cpi") || titleLower.includes("transmission") || titleLower.includes("econometric");
        const isPolicy = titleLower.includes("policy") || titleLower.includes("recommendation");

        let cardClasses = "rounded p-2.5 text-xs space-y-2 ";
        let titleColor = "text-slate-900";
        let icon = null;

        if (isExec) {
          cardClasses += "border border-amber-200 bg-amber-50/80 text-slate-800";
          titleColor = "text-amber-950 font-bold uppercase tracking-wider text-[10px]";
          icon = <Sparkles className="h-3.5 w-3.5 text-amber-600" />;
        } else if (isTelemetry) {
          cardClasses += "border border-slate-200 bg-white shadow-xs text-slate-800";
          titleColor = "text-slate-900 font-bold uppercase tracking-wider text-[10px]";
          icon = <Sparkles className="h-3.5 w-3.5 text-slate-600" />;
        } else if (isCpi) {
          cardClasses += "border border-blue-200 bg-blue-50/70 text-blue-950";
          titleColor = "text-blue-900 font-bold uppercase tracking-wider text-[10px]";
          icon = <Sparkles className="h-3.5 w-3.5 text-blue-600" />;
        } else if (isPolicy) {
          cardClasses += "border border-emerald-200 bg-emerald-50/70 text-emerald-950";
          titleColor = "text-emerald-900 font-bold uppercase tracking-wider text-[10px]";
          icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
        } else if (block.title) {
          cardClasses += "border border-slate-200 bg-slate-50/80 text-slate-800";
          titleColor = "text-amber-900 font-bold text-xs";
          icon = <Sparkles className="h-3.5 w-3.5 text-amber-600" />;
        } else {
          cardClasses = "text-xs space-y-1.5 text-slate-800";
        }

        return (
          <div key={bIdx} className={cardClasses}>
            {block.title && (
              <div className="flex items-center gap-1.5 border-b pb-1.5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                {icon}
                <span className={titleColor}>{block.title}</span>
              </div>
            )}

            {block.content.map((item, cIdx) => {
              if (item.type === "h4") {
                return (
                  <h4 key={cIdx} className="font-bold text-[11px] text-slate-900 pt-1">
                    {renderInline(item.title)}
                  </h4>
                );
              }

              if (item.type === "math") {
                return (
                  <div key={cIdx} className="rounded bg-slate-900/5 px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
                    {item.formula.replace(/\\text\{([^}]+)\}/g, "$1").replace(/\\times/g, "×").replace(/\\Delta/g, "Δ")}
                  </div>
                );
              }

              if (item.type === "list") {
                return (
                  <ul key={cIdx} className="space-y-1.5 pl-0.5">
                    {item.items.map((it, liIdx) => (
                      <li key={liIdx} className="flex items-start gap-1.5 leading-relaxed text-slate-800">
                        <span className="font-bold text-amber-600 select-none">•</span>
                        <div className="flex-1">{renderInline(it)}</div>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={cIdx} className="leading-relaxed text-slate-800">
                  {renderInline(item.text)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function PolicyCopilot({ isOpen, onClose }: Props) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Greetings. I am ARIA (Airfare Research & Intelligence Assistant). Ask me any question about DGCA route inflation, ATF price shock transmission, carrier concentration, or CPI basis-point impacts.",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const promptChips = [
    "Analyze DEL-BOM surge risk for upcoming festive window",
    "What is the projected CPI impact if ATF rises 15%?",
    "Which corridor shows highest carrier monopoly concentration?",
  ];

  if (!visible && !isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${data.error || "Unable to reach copilot"}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network error calling ARIA Copilot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`civic-card flex h-full w-full max-w-lg flex-col justify-between border-l p-4 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--card-bg)" }}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-slate-950 font-bold shadow">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  Ask ARIA <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  AI Policy Copilot • MoSPI / RBI Intelligence Engine
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {promptChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                className="border border-amber-500/40 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded shadow-xs ${
                m.role === "user"
                  ? "bg-slate-100 border-slate-300 text-slate-900 self-end ml-6"
                  : "bg-slate-50 border-amber-200/80 text-slate-900"
              }`}
            >
              <p className="font-bold text-[10px] uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1">
                {m.role === "user" ? "Policy Analyst Query" : "ARIA AI Policy Briefing"}
              </p>
              <FormatMessageContent text={m.text} />
            </div>
          ))}
          {loading && (
            <div className="p-3 border bg-amber-50/50 border-amber-300 text-xs italic font-medium text-amber-900 animate-pulse rounded">
              ARIA is synthesizing live database metrics & CPI policy transmission vectors...
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="border-t pt-3" style={{ borderColor: "var(--card-border)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask ARIA about airfare inflation, ATF shock, or route risk..."
              className="flex-1 border px-3 py-2 text-xs focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--card-bg)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-1 border border-amber-500 bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
