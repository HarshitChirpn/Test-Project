import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack";

const PROCESS_PHASES = [
  {
    id: "process-1",
    title: "Discover",
    description:
      "Discover new possibilities with IDEA 2 MVP's \"Discover\" service. Explore curated content, learn from experts, and uncover innovative solutions to enhance your business.",
  },
  {
    id: "process-2",
    title: "Define",
    description:
      "To define is to clarify and specify the meaning of a word, term, concept, or idea, outlining its characteristics and boundaries for better understanding.",
  },
  {
    id: "process-3",
    title: "Design",
    description:
      "Design is the process of creating visual or functional solutions to a problem or need, using elements such as form, color, texture, and layout to achieve aesthetic and practical goals.",
  },
  {
    id: "process-4",
    title: "Develop",
    description:
      "To develop is to work on and improve something over time, often through a systematic and intentional process of research, design, testing, and refinement, with the goal of achieving a desired outcome or result.",
  },
  {
    id: "process-5",
    title: "Deploy",
    description:
      "To deploy is to put a plan or strategy into action, often involving the implementation and distribution of resources, tools, or systems, to achieve a specific objective or goal in a particular context.",
  },
  {
    id: "process-6",
    title: "Deliver",
    description:
      "To deliver is to transport or provide goods, services, or information to a recipient, meeting their expectations and fulfilling their needs or requirements in a timely, efficient, and effective manner.",
  },
];

const Process = () => {
  return (
    <div className="container place-content-center bg-background px-6 py-24 text-foreground xl:px-12">
      <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12">
        <div className="left-0 top-0 md:sticky md:h-svh md:py-12">
          <h5 className=" text-xs uppercase tracking-wide">our process</h5>
          <h2 className="mb-6 mt-4 text-4xl font-bold tracking-tight">
            Planning your{" "}
            <span className="text-brand-yellow">product development</span>{" "}
            journey
          </h2>
          <p className="max-w-prose text-sm">
            Our journey begins with a deep dive into your vision. In the
            Discovery phase, we engage in meaningful conversations to grasp your
            brand identity, goals, and the essence you want to convey. This
            phase sets the stage for all that follows.
          </p>
        </div>
        <div>
          <ContainerScroll className="min-h-[200vh] space-y-8 py-12">
            {PROCESS_PHASES.map((phase, index) => (
              <CardSticky
                key={phase.id}
                index={index + 2}
                className="rounded-2xl border p-8 shadow-md backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="my-6 text-2xl font-bold tracking-tighter">
                    {phase.title}
                  </h2>
                  <h3 className="text-2xl font-bold text-brand-yellow">
                    {String(index + 1).padStart(2, "0")}
                  </h3>
                </div>

                <p className="text-foreground">{phase.description}</p>
              </CardSticky>
            ))}
          </ContainerScroll>
        </div>
      </div>
    </div>
  );
};

export { Process };
