import type { FaqItem } from "@/lib/data/faq";

/**
 * The material an AI Automation buyer needs and the offer pages were missing.
 *
 * Those pages carried the scope and the steps but stopped before the two
 * questions a buyer of expensive implementation actually asks: when do I have
 * what, and what happens if it does not work. Both are answered here from what
 * is already published — the durations in the offer names, the approval
 * boundary the site states everywhere — and nothing else. No engagement
 * outcome is quantified: none has been measured and published yet, and the
 * proof band says so in as many words.
 */

export type TimelinePoint = {
  /** When, in the offer's own units. Only durations the site already publishes. */
  when: string;
  title: string;
  text: string;
};

export type OfferDetail = {
  timelineTitle: string;
  timelineNote: string;
  timeline: TimelinePoint[];
  faq: FaqItem[];
};

/** Asked on every engagement, so answered on every offer page. */
const sharedFaq: FaqItem[] = [
  {
    q: "What access do you need to our systems?",
    a: "Only what the agreed workflow touches, and only for the accounts it runs on. Access is requested per tool, in writing, and can be revoked at handover. We do not ask for admin access to systems outside the scope, and we do not move customer data anywhere it was not already stored.",
  },
  {
    q: "What stays with a human?",
    a: "Every decision where a mistake carries real cost: money leaving the company, a promise to a customer, anything legal, and anything sent under your name to someone who matters. The system prepares and proposes; a named person approves. Which steps those are is written down before the build starts and again in the handover.",
  },
  {
    q: "Who owns the system after you leave?",
    a: "You do. Everything runs inside your own accounts and tools, the rules are written in plain language, and the handover names the person on your side responsible for daily operation. There is no dependency on us to keep it running, and no licence that expires.",
  },
  {
    q: "What if it does not work?",
    a: "Where something is built, normal cases and edge cases are both tested before handover, and anything still unresolved is written into the handover rather than left silent. Testing narrows what reaches production; it does not promise nothing will fail there, which is exactly why the approval boundary and the written limits exist. And if a workflow turns out to be a bad fit for automation during the engagement, we say so and stop building it — that answer is part of the work, not a failure of it.",
  },
];

export const offerDetail: Record<"ai-audit" | "ai-sprint" | "business-os", OfferDetail> = {
  "ai-audit": {
    timelineTitle: "What you have, and when",
    timelineNote:
      "An audit is scheduled around your calendar rather than sold as a fixed number of weeks, so this is the order of the work, not a countdown.",
    timeline: [
      {
        when: "Before we start",
        title: "The workflow, in your words",
        text: "You describe the process in plain language and name the people and tools it touches. Nothing is prepared or formatted on your side.",
      },
      {
        when: "During the review",
        title: "Evidence, then the map",
        text: "Inputs, decisions, handoffs and failure points are recorded first. Only then is AI assistance separated from work that should stay manual or human-approved.",
      },
      {
        when: "At the end",
        title: "A scoped brief you can act on",
        text: "A prioritized next build with its dependencies, its risks and the boundary of the next engagement — including the parts we recommend not automating.",
      },
    ],
    faq: [
      {
        q: "Is the audit useful if we do not build anything afterwards?",
        a: "Yes, and it is a normal outcome. The deliverable is the map and the scoped brief: they stay yours, they name what should not be automated as clearly as what should, and you can hand them to any implementer, in-house or otherwise. There is no obligation to continue with us.",
      },
      {
        q: "How is this different from the 60-minute mini-audit?",
        a: "The mini-audit is one conversation about one question, with a short memo after. The AI Audit reviews an entire workflow end to end — its inputs, decisions, handoffs and failure points — and produces a prioritized scope for a build. If you already know which process to fix, the mini-audit may be enough.",
      },
      ...sharedFaq,
    ],
  },
  "ai-sprint": {
    timelineTitle: "What exists at the end of each week",
    timelineNote:
      "Four weeks is the published length of this engagement. The dates are agreed before it starts and do not move without a written reason.",
    timeline: [
      {
        when: "Week 1",
        title: "Agreed design",
        text: "The workflow, data flow, approval rules, tools and acceptance criteria are confirmed in writing. If something does not survive this week, it does not get built.",
      },
      {
        when: "Weeks 2–3",
        title: "A working build, tested",
        text: "Configured automations, prompts and rules — running, not mocked up. Normal cases and edge cases are both tested, and unresolved limits are recorded as they are found.",
      },
      {
        when: "Week 4",
        title: "Handover and training",
        text: "Your team is trained on the live system, the written instructions are delivered, and one named person takes ownership of daily operation.",
      },
      {
        when: "After",
        title: "It runs without us",
        text: "The system lives in your accounts, the rules are readable by whoever inherits them, and the known limits are stated rather than discovered later.",
      },
    ],
    faq: [
      {
        q: "Why one process and not several?",
        a: "Because four weeks is enough to finish one workflow properly — designed, built, tested, handed over — and not enough to half-finish three. A system nobody was trained to run is not a result. If several processes need work, the audit prioritizes them and the sprint takes the first.",
      },
      {
        q: "How much of our team's time does this take?",
        a: "Concentrated in week 1 and week 4: the design decisions and the training. Weeks 2 and 3 are build and test on our side, with short check-ins. The people who must be available are the process owner and whoever approves the decisions the workflow makes.",
      },
      ...sharedFaq,
    ],
  },
  "business-os": {
    timelineTitle: "What exists at the end of each stage",
    timelineNote:
      "Eight weeks is the published length of this engagement. Stages overlap where the work allows it, but no stage is declared finished before the one it depends on.",
    timeline: [
      {
        when: "Weeks 1–2",
        title: "The operating model, agreed",
        text: "Shared sources, responsibilities, approval rules and the order in which systems must change — mapped and signed off before anything is built.",
      },
      {
        when: "Weeks 3–6",
        title: "Connected layers, built and tested",
        text: "The agreed sales, operations, knowledge and automation layers are implemented against the model and tested together, not one at a time in isolation.",
      },
      {
        when: "Weeks 7–8",
        title: "Adoption by role",
        text: "Each role is trained on what it actually does, operating instructions are published where the team already looks, and ownership is handed over with the known limits written down.",
      },
      {
        when: "After",
        title: "One operating model, owned by you",
        text: "Handoffs have owners, approvals have rules, and the parts that were deliberately left manual are documented as decisions rather than gaps.",
      },
    ],
    faq: [
      {
        q: "How is this different from four separate sprints?",
        a: "Sprints solve one workflow each and are correct when workflows are independent. This engagement exists for the case where they are not: several teams depend on the same customer, process or knowledge data, and fixing them separately leaves the handoffs between them broken. The operating model is the deliverable that separate sprints cannot produce.",
      },
      {
        q: "What does leadership have to commit to?",
        a: "Two things: a named process owner for each area in scope, and approval of the eight-week scope before the build starts. Without the first, the system has nobody to belong to after handover. Without the second, the stages cannot be sequenced.",
      },
      ...sharedFaq,
    ],
  },
};

/** For the AI Automation index, where the reader is still choosing a format. */
export const automationFaq: FaqItem[] = [
  {
    q: "How is AI Automation different from AI Visibility?",
    a: "They are separate products and are sold separately. AI Visibility measures what AI systems show about your business from the outside — it is a measurement subscription with published methodology. AI Automation is custom work inside your business: processes, rules and systems your team runs. Buying one does not require the other.",
  },
  {
    q: "Which format should we start with?",
    a: "If you know which process hurts and want it fixed, start with the 4-Week AI Sprint. If several ideas compete and the cause is not clear, start with the AI Audit. If one specific question needs an answer, the 60-minute mini-audit is enough. If workflows across teams depend on each other, that is the Business OS engagement.",
  },
  {
    q: "Do you guarantee a result or a saving?",
    a: "No. Nobody honestly can before seeing the process, and a guaranteed percentage is a sales device, not a measurement. What is committed is the scope, the timeline and the deliverable of the format you choose: a short memo for the 60-minute mini-audit, a workflow map and a scoped next-step brief for the AI Audit, and — for the Sprint and the Business OS engagement — a working system, tested, with your team trained and the limits written down.",
  },
  ...sharedFaq,
];
