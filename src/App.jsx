import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');`;

const INTERVENTION_LAYERS = [
  { id: "data", label: "Data Layer", sublabel: "What models are trained on", color: "#C8A96E", examples: ["GDPR / training data rights", "Copyright & scraping", "Consent frameworks", "Data provenance"], govGap: "HIGH", gapColor: "#C8A96E", description: "The rawest governance surface. What data can be scraped, used, retained? Who owns what a model learned? GDPR governs data storage but says almost nothing about what a model learned and retained from that data — a deep category mismatch." },
  { id: "model", label: "Model Layer", sublabel: "The artifact itself", color: "#8FB8AD", examples: ["Model cards & disclosure", "Safety evals & red-teaming", "Capability thresholds", "Export controls"], govGap: "HIGH", gapColor: "#C8A96E", description: "Governing the trained model as a product or infrastructure. Disclosure, auditing, and capability limits. The EU AI Act's GPAI rules (active Aug 2025) represent the first serious attempt to govern at this layer anywhere in the world." },
  { id: "deployment", label: "Deployment Layer", sublabel: "Domain-specific usage", color: "#9B7EC8", examples: ["HIPAA for health AI", "FINRA for finance AI", "FERPA for education AI", "Sector-specific mandates"], govGap: "MEDIUM", gapColor: "#8FB8AD", description: "Existing sectoral frameworks adapted to AI. The most tractable layer — regulated industries already have compliance infrastructure. The gap: vast unregulated sectors (consumer apps, social media, hiring tools) have no sectoral equivalent." },
  { id: "runtime", label: "Runtime Layer", sublabel: "Inference & behavior in use", color: "#D4736A", examples: ["Jailbreak / adversarial use", "Prompt injection", "Real-time monitoring", "Output watermarking"], govGap: "CRITICAL", gapColor: "#D4736A", description: "The least governed and hardest to govern layer. A model can be trained cleanly, documented well, and deployed appropriately — and still behave harmfully based on how it is prompted in deployment. Almost no existing law touches this layer." },
];

const ACTORS = [
  { id: "state", label: "Nation States", icon: "⚖", role: "International treaties, coordination frameworks", lag: "Very High" },
  { id: "fed", label: "Federal Govt", icon: "🏛", role: "Sector agencies (FTC, FDA, SEC), executive orders", lag: "High" },
  { id: "state_gov", label: "State Govts", icon: "🗺", role: "Patchwork laws — CA, CO, NY, IL, TX", lag: "Medium" },
  { id: "industry", label: "Industry Bodies", icon: "🤝", role: "Standards orgs, voluntary commitments, audit frameworks", lag: "Medium" },
  { id: "company", label: "Companies", icon: "🏢", role: "Internal governance, ethics boards, red teams", lag: "Low" },
  { id: "individual", label: "Citizens & Individuals", icon: "👤", role: "Engineers, product managers, executives — and every internet user as civic participant", lag: "Lowest" },
];

const LEGAL_INVENTIONS = [
  { id: "irb", era: "1974–79", name: "IRB / Research Ethics Boards", origin: "National Research Act 1974; Belmont Report 1979, post-Tuskegee", mechanism: "Distributed, domain-embedded ethics review before research begins. Slows research without requiring a central regulator to understand the science. The key insight: push review to the institution with domain knowledge and reputational skin in the game.", aiMapping: "AI IRBs for high-stakes deployments — review before launch in healthcare, hiring, criminal justice. Some universities and labs have piloted this. It is the strongest structural analog because it is distributed, domain-specific, and ex ante without requiring a federal agency to keep pace with the technology.", type: "ex_ante", strength: 5, weakness: "Works when institutions have tenure, accreditation, and reputation to lose. Startups deploying AI in a competitive market have none of those structural incentives. Without a liability backstop or funding conditionality, AI IRB-equivalents become checkbox exercises.", tag: "STRONGEST ANALOG", tagColor: "#8FB8AD" },
  { id: "sec", era: "1933–34", name: "SEC Mandatory Disclosure Regime", origin: "Securities Acts, post-1929 crash", mechanism: "Mandatory show-your-work. Regulators don't need to understand every instrument — they require transparency so that others with skin in the game (investors, counterparties, auditors) can evaluate risk themselves. Shifts the governance burden without requiring expert regulators.", aiMapping: "Mandatory disclosure of training data sources, evaluation results, known failure modes, and red-team findings. Let markets, insurers, and downstream deployers do the risk assessment. The SEC model suggests the key requirement isn't restriction — it's legibility.", type: "ex_ante", strength: 4, weakness: "Credit rating agencies showed that delegated technical evaluation can be captured by the entities being evaluated (see: 2008 financial crisis). An AI audit industry could develop the same conflict of interest if auditors are paid by the companies they audit.", tag: "HIGH POTENTIAL", tagColor: "#C8A96E" },
  { id: "macpherson", era: "1916", name: "MacPherson v. Buick — Products Liability", origin: "NY Court of Appeals; Judge Cardozo ruling", mechanism: "Buick bought a wheel from a third-party manufacturer (Imperial Wheel Co.), assembled the car without inspecting it, and sold it to a dealer who sold it to MacPherson. When the defective wheel collapsed, the court held Buick — not the wheel-maker, not the dealer — liable. The manufacturer of the finished product owes a duty of care to foreseeable end users, regardless of privity of contract.", aiMapping: "The AI harm chain runs: training data → model developer → API provider → application builder → end user → affected third party. Who is 'Buick'? The platform that assembles and deploys the finished product to foreseeable users is the most likely candidate. Someone will be the MacPherson case for AI — the question is which harm, which plaintiff, which defendant.", type: "ex_post", strength: 4, weakness: "MacPherson worked because the harm was immediate, physical, and attributable to a specific product. AI harms are often diffuse (hiring discrimination, information distortion), probabilistic, and affect people who never consented to interact with the system. Establishing the causal chain in court is far harder.", tag: "WATCH THIS SPACE", tagColor: "#9B7EC8" },
  { id: "toxictort", era: "1970s–90s", name: "Toxic Tort / Epidemiological Causation", origin: "Asbestos, tobacco, and lead paint litigation", mechanism: "Courts learned to accept statistical and population-level causation: 'this substance increases cancer risk in exposed populations' — not requiring proof that it caused any one person's illness. Epidemiological evidence became legally sufficient. A genuine legal invention: courts rewrote what counted as proof of causation.", aiMapping: "AI harms will often look like this: the model didn't cause the hiring discrimination — it increased its probability systematically across a population. Toxic tort doctrine gives courts a framework for accepting that argument. The class action is the most likely vehicle.", type: "ex_post", strength: 3, weakness: "Toxic tort cases took decades and millions of harmed people before liability was established. AI harms may not be slow and physical enough for this timeline — and the defendants (tech companies) have vastly more resources to litigate delay than asbestos manufacturers did.", tag: "SLOW BUT REAL", tagColor: "#D4736A" },
  { id: "buildingcode", era: "Early 1900s", name: "Building Code Model", origin: "Post-industrial urban safety failures — fires, structural collapses", mechanism: "Governance at the chokepoint — the building permit, the inspection — not at the level of materials science. Technically complex standards are developed by industry bodies (ICC), updated on a cycle, and enforced at the moment of construction. The regulator doesn't need to understand structural engineering; they enforce at the gate.", aiMapping: "AI chokepoints: cloud compute providers (AWS, Azure, GCP), app stores (Apple, Google Play), insurance underwriters, enterprise procurement. Governing the chokepoint is more tractable than governing the technology itself. Compute access requirements — mandatory safety review before large training runs — are a direct version of this logic.", type: "ex_ante", strength: 4, weakness: "Building codes work because construction requires permits at identifiable physical locations. Open-source AI models and consumer hardware increasingly diffuse these chokepoints — anyone can run frontier-class models locally, with no gatekeeper in the chain.", tag: "INFRASTRUCTURE LOGIC", tagColor: "#8FB8AD" },
  { id: "spectrum", era: "1927–34", name: "FCC Spectrum Allocation", origin: "Radio chaos of the 1920s; Radio Act 1927, Communications Act 1934", mechanism: "Spectrum was a previously ungoverned commons — anyone could broadcast, signals collided, the medium was unusable. The solution invented a new legal category: a public resource allocated for private use with ongoing public obligations attached. The commons was propertized with strings.", aiMapping: "Should foundation models or compute infrastructure be treated as a public utility rather than a private product? If a frontier AI system is more like the electrical grid than a consumer appliance, the governance logic changes entirely — toward utility regulation, universal access obligations, and public interest conditions on use.", type: "ex_ante", strength: 3, weakness: "Radio spectrum is physically finite, geographically bounded, and nationally controllable. AI compute and model weights are globalizing rapidly — the jurisdictional leverage that made FCC allocation work is much harder to establish for technology with no physical location.", tag: "INFRASTRUCTURE LOGIC", tagColor: "#8FB8AD" },
  { id: "npt", era: "1968", name: "Nuclear Non-Proliferation Treaty", origin: "Cold War arms race; signed 1968, in force 1970", mechanism: "Even adversarial actors can reach arms control agreements when risk is sufficiently legible and catastrophic. The NPT worked partly because you could count warheads, verify stockpiles, and establish clear red lines. Coordination required legible risk — you had to be able to measure the danger.", aiMapping: "International AI coordination is possible — but currently lacks the risk legibility that made nuclear arms control work. The most productive near-term goal may not be treaties, but investments in making AI risks measurable: standardized evals, capability benchmarks, transparency requirements that create a shared vocabulary for what we're afraid of.", type: "ex_ante", strength: 2, weakness: "Nuclear actors are states with identifiable infrastructure. AI actors are thousands of companies and open-source communities. The 'if we don't, China will' argument applies to AI as much as to nuclear — but nuclear coordination still happened once risk became legible enough. The lesson: legibility first, then coordination.", tag: "ASPIRATIONAL", tagColor: "#C8A96E" },
  { id: "gdpr", era: "2018", name: "GDPR / Data Protection Law", origin: "EU data protection reform; in force May 2018", mechanism: "Created enforceable individual data rights (access, deletion, portability), mandatory consent frameworks, and cross-border data flow rules. Exported European standards globally through market access leverage — the 'Brussels Effect' forced US companies to partially comply worldwide.", aiMapping: "GDPR governs training data inputs but has almost nothing meaningful to say about what a model learned and retained from that data. The model is the residue of data but is legally distinct from it. GDPR's 'right to erasure' doesn't clearly extend to model weights — a deep unresolved gap.", type: "ex_ante", strength: 3, weakness: "Written in a world where data is processed and stored, not learned from and transformed. The fundamental category mismatch: GDPR thinks about data as a record; AI uses data as a teacher. The EU AI Act attempts to patch some of this, but the underlying legal architecture was not built for trained models.", tag: "PARTIAL FIT", tagColor: "#D4736A" },
  { id: "tort_liability", era: "Ongoing", name: "Ex Post Liability / Structured Tort Law", origin: "Anglo-American legal tradition; product liability evolution", mechanism: "Liability for harm after the fact. Adaptive and hard to capture because no regulator controls it. The US legal tradition strongly favors this approach: create clear liability, let the threat discipline behavior, litigate harms when they occur. No regulator needs to understand the technology in advance.", aiMapping: "If AI companies faced meaningful tort liability, internal governance would become economically rational — just as financial firms' compliance functions exist because liability concentrates cost. The missing ingredient: AI firms currently face minimal liability, sheltered by novel harm chains courts haven't adjudicated.", type: "ex_post", strength: 4, weakness: "The US legal tradition favors ex post, but current AI liability exposure is minimal — no established duty of care, unclear standing for diffuse harms, well-resourced defendants who can litigate indefinitely. Creating liability surfaces is actually a more tractable legislative goal than 'regulating AI.'", tag: "HIGH POTENTIAL", tagColor: "#C8A96E" },
  { id: "negligence", era: "Common law", name: "Professional Negligence / Standard of Care", origin: "Medical and legal malpractice doctrine", mechanism: "Courts don't define what a good surgeon does — they defer to the profession's own standards of practice, then ask whether the defendant met them. 'Standard of care' is defined and updated by the professional community itself, without requiring legislative cycles.", aiMapping: "Let professional communities — medical AI, legal AI, hiring AI — develop domain-specific standards of care. Make adherence legally relevant in litigation. Use malpractice-style cases to surface violations and drive standard evolution. This is already beginning in AI-assisted medical diagnosis.", type: "ex_post", strength: 4, weakness: "Professional negligence requires mature professional communities with established norms, licensing, and reputational stakes. The AI industry has almost none of these yet. A long-term trajectory, not a near-term fix — but worth building the infrastructure for now.", tag: "MATURING", tagColor: "#8FB8AD" },
];

const CURRENT_LANDSCAPE = [
  { id: "eu_ai_act", name: "EU AI Act", jurisdiction: "European Union", status: "Active (phased)", type: "Comprehensive legislation", layer: ["model", "deployment"], approach: "ex_ante", date: "In force Aug 2024; GPAI rules Aug 2025", summary: "World's first comprehensive AI legal framework. Risk-tiered approach: prohibited uses banned Feb 2025, GPAI model rules active Aug 2025, high-risk system rules by 2027. EU Commission's Digital Omnibus (Nov 2025) now proposes easing some timelines — the regulation is being renegotiated before it is fully in force.", signal: "🟡", signalLabel: "Softening", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
  { id: "trump_eo", name: "US Executive Order (Dec 2025)", jurisdiction: "United States", status: "Active", type: "Executive order", layer: ["model", "deployment"], approach: "ex_post", date: "December 11, 2025", summary: "Directs DOJ to identify and challenge 'onerous' state AI laws. Seeks to centralize AI policy at federal level and preempt state regulation through litigation and agency action. Follows Jan 2025 EO revoking Biden's safety-focused order. US posture: remove friction, assert competitiveness.", signal: "🔴", signalLabel: "Deregulatory", url: "https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/" },
  { id: "state_patchwork", name: "US State Patchwork", jurisdiction: "United States (states)", status: "Active / contested", type: "State legislation", layer: ["deployment", "model"], approach: "ex_ante", date: "Ongoing — 1,000+ bills introduced 2024–25", summary: "California, Colorado, New York, Illinois, and Texas leading on algorithmic accountability, bias mitigation, and transparency. Senate voted 99-1 on July 1, 2025 to strip the federal AI moratorium from the One Big Beautiful Bill, preserving state authority for now. Federal EO Dec 2025 now using litigation strategy to challenge these laws.", signal: "🟠", signalLabel: "Under pressure", url: "https://www.goodwinlaw.com/en/insights/publications/2025/07/alerts-practices-aiml-federal-ai-moratorium-dies-on-the-vine" },
  { id: "council_europe", name: "Council of Europe AI Treaty", jurisdiction: "International", status: "Open for signature", type: "Binding international treaty", layer: ["model", "deployment"], approach: "ex_ante", date: "Opened for signature Sep 2024", summary: "World's first legally binding international AI treaty. Uniquely applies to both public and private actors — not just governments. Sets obligations around human rights, democracy, and rule of law across the full AI lifecycle. A structural innovation: international law that binds private companies directly.", signal: "🟢", signalLabel: "Novel", url: "https://www.anecdotes.ai/learn/ai-regulations-in-2025-us-eu-uk-japan-china-and-more" },
  { id: "ftc_comply", name: "FTC Operation AI Comply", jurisdiction: "United States", status: "Active", type: "Enforcement action", layer: ["deployment"], approach: "ex_post", date: "2024–ongoing", summary: "FTC using existing consumer protection authority to address deceptive AI practices — false capability claims, manipulative design, unlawful data collection. Ex post enforcement via existing law, no new AI-specific statute needed. Classic US approach: let harms emerge, then litigate.", signal: "🟡", signalLabel: "Incremental", url: "https://www.morganlewis.com/pubs/2025/12/the-new-rules-of-ai-a-global-legal-overview" },
  { id: "south_korea", name: "South Korea AI Framework Act", jurisdiction: "South Korea", status: "Enacted", type: "National legislation", layer: ["model", "deployment"], approach: "ex_ante", date: "Finalized January 2025", summary: "Strengthens transparency and safety requirements with government-backed R&D promotion. Part of South Korea's bid to be a global AI hub with governance guardrails — attempting to thread the needle between EU precaution and US permissiveness.", signal: "🟢", signalLabel: "Active", url: "https://iapp.org/news/a/global-ai-law-and-policy-tracker-highlights-and-takeaways" },
  { id: "japan", name: "Japan AI Promotion Act", jurisdiction: "Japan", status: "Enacted", type: "National legislation", layer: ["deployment"], approach: "ex_ante", date: "May 2025", summary: "Deliberately light-touch: encourages companies to cooperate with government safety measures. Primary enforcement mechanism is public disclosure of non-compliant companies — a shame-based compliance model. No hard mandates, no fines.", signal: "🟡", signalLabel: "Soft touch", url: "https://iapp.org/news/a/global-ai-law-and-policy-tracker-highlights-and-takeaways" },
  { id: "china", name: "China AI Labeling Rules", jurisdiction: "China", status: "In effect Sep 2025", type: "Regulatory rules", layer: ["deployment", "runtime"], approach: "ex_ante", date: "September 2025", summary: "Requires explicit and implicit labeling of AI-generated content across text, audio, images, video, and virtual scenes. Detailed, specific, and enforceable — without a comprehensive AI law. China's approach: targeted sector rules rather than a single framework, moving faster than comprehensive legislation would allow.", signal: "🟡", signalLabel: "Targeted", url: "https://iapp.org/news/a/global-ai-law-and-policy-tracker-highlights-and-takeaways" },
  { id: "voluntary", name: "Frontier Lab Voluntary Commitments", jurisdiction: "Global (private)", status: "Ongoing", type: "Private governance", layer: ["model"], approach: "ex_ante", date: "2023–ongoing", summary: "White House voluntary commitments from OpenAI, Anthropic, Google, Meta et al. on safety evals, red teaming, and watermarking. Anthropic's Public Benefit Corporation structure and OpenAI's capped-profit model are private experiments in new legal forms. Significant structural gap: no enforcement mechanism.", signal: "🔴", signalLabel: "Unenforceable", url: "" },
  { id: "paiassociation", name: "Partnership on AI", jurisdiction: "Global (civil society)", status: "Active", type: "Civil society", layer: ["model", "deployment"], approach: "ex_ante", date: "Founded 2016", summary: "Multi-stakeholder body including NGOs, academics, and companies developing shared norms, research, and guidance for responsible AI. Focus areas include synthetic media, worker displacement, and safety. Norm-setting without enforcement authority — its value is legitimacy and convening power.", signal: "🟡", signalLabel: "Norm-setting", url: "https://partnershiponai.org", civic: true },
  { id: "aisafety", name: "AI Safety Institute Network", jurisdiction: "International (govt-adjacent)", status: "Active", type: "Intergovernmental", layer: ["model"], approach: "ex_ante", date: "Launched 2023–24", summary: "UK, US, EU, and 25+ national AI safety institutes collaborating on frontier model evaluations and shared safety standards. Blurs the line between government and civil society — technical experts, not legislators, doing the governance work. Closest existing thing to an international AI measurement body.", signal: "🟢", signalLabel: "Emerging", url: "https://www.gov.uk/government/organisations/ai-safety-institute", civic: true },
  { id: "aiedu", name: "AI Literacy & Civic Education Initiatives", jurisdiction: "Global (civil society)", status: "Fragmented", type: "Civil society", layer: ["deployment", "runtime"], approach: "ex_ante", date: "2023–ongoing", summary: "Growing ecosystem of NGOs, libraries, schools, and community organizations building AI literacy programs — teaching citizens what AI is, how to detect synthetic content, and how to participate in governance. Day One Project, AI4K12, UNESCO's AI competency framework. Chronically underfunded relative to the scale of deployment.", signal: "🟠", signalLabel: "Underpowered", url: "https://ai4k12.org", civic: true },
  { id: "contentauth", name: "Content Authenticity Initiative / C2PA", jurisdiction: "Global (industry-led)", status: "Active", type: "Technical standard", layer: ["runtime", "deployment"], approach: "ex_ante", date: "Launched 2019; C2PA spec 2021", summary: "Coalition of Adobe, BBC, Intel, Microsoft, and others developing open technical standards for content provenance — cryptographic watermarking that attaches verifiable origin data to images, video, and audio. The infrastructure layer that civic disclosure norms depend on. Voluntary adoption; not yet universal.", signal: "🟡", signalLabel: "Scaling", url: "https://contentauthenticity.org", civic: true },
  { id: "aisafetynorms", name: "AI Incident Database", jurisdiction: "Global (civil society)", status: "Active", type: "Civil society", layer: ["deployment", "runtime"], approach: "ex_post", date: "Launched 2020", summary: "Publicly accessible database of AI system failures and harms, maintained by the Responsible AI Collaborative. Directly addresses the 'legibility of harm' problem — making AI incidents visible, searchable, and attributable so norms and law can respond to documented reality rather than hypotheticals.", signal: "🟢", signalLabel: "Active", url: "https://incidentdatabase.ai", civic: true },
];

const NEWS_ITEMS = [
  { date: "Dec 2025", headline: "Trump EO targets state AI laws via litigation", summary: "Executive order directs DOJ to challenge state regulations deemed 'onerous' or ideologically driven. Senate's 99-1 rejection of the moratorium in July shifted the arena — now the fight moves to courts.", type: "Regulatory", signal: "deregulatory" },
  { date: "Nov 2025", headline: "EU Digital Omnibus proposes softening AI Act timelines", summary: "Commission proposes deferring high-risk AI system rules and giving GPAI providers more compliance time. The regulation is being renegotiated before it is fully in force — a significant signal about the limits of ex ante regulation speed.", type: "Legislative", signal: "softening" },
  { date: "Oct 2025", headline: "AI Incident Database passes 1,000 documented harms", summary: "The civil-society AI Incident Database crossed 1,000 catalogued AI system failures, covering bias in hiring tools, autonomous vehicle accidents, and generative AI misuse. The database is becoming a reference for both litigation and legislative drafting.", type: "Civic", signal: "active" },
  { date: "Aug 2025", headline: "EU AI Act GPAI rules become applicable", summary: "Rules for general-purpose AI models — transparency, copyright, systemic-risk assessment — entered force. First time GPAI developers face binding rules anywhere in the world.", type: "Regulatory", signal: "active" },
  { date: "Jul 2025", headline: "Senate 99-1: AI moratorium stripped from reconciliation bill", summary: "On July 1, the Senate removed the 10-year state AI moratorium from the One Big Beautiful Bill in a 99-1 vote. The bill was signed July 4 without the moratorium. Only Sen. Thom Tillis voted no — reportedly possibly in error.", type: "Legislative", signal: "active" },
  { date: "Jun 2025", headline: "C2PA content authenticity standard reaches major platform adoption", summary: "Google, Meta, and TikTok begin displaying C2PA provenance data on images and video. The technical standard for AI content disclosure moves from pilot to at-scale deployment — a civic infrastructure milestone. Coverage still incomplete.", type: "Civic", signal: "active" },
  { date: "May 2025", headline: "Japan enacts light-touch AI Promotion Act", summary: "Encourages cooperation and uses public shaming as enforcement. No fines, no hard mandates — a live test of whether transparency-based governance can work without coercive teeth.", type: "Legislative", signal: "soft" },
  { date: "Mar 2025", headline: "UNESCO launches global AI literacy framework for schools", summary: "Sets competency benchmarks for AI education across K-12. First intergovernmental attempt to define what civic AI literacy means. Implementation depends entirely on national governments; unevenly adopted.", type: "Civic", signal: "softening" },
  { date: "Jan 2025", headline: "South Korea finalizes AI Framework Act", summary: "Transparency and safety requirements paired with R&D support. One of the cleaner attempts globally at pro-innovation-with-guardrails governance.", type: "Legislative", signal: "active" },
  { date: "Jan 2025", headline: "Trump revokes Biden AI safety executive order on day one", summary: "EO 14110 rescinded immediately. Shifts US framing from 'safe, secure, trustworthy' to 'remove barriers, assert dominance.' A sharp turn in national posture.", type: "Regulatory", signal: "deregulatory" },
  { date: "Nov 2024", headline: "Responsible AI Collaborative expands AI Incident Database", summary: "New categorization system distinguishes harms by severity, domain, and affected population. Making AI harm visible and searchable is the precondition for any civic or legal response.", type: "Civic", signal: "active" },
  { date: "Sep 2024", headline: "Council of Europe AI Treaty opens for signature", summary: "First legally binding international AI treaty. Applies to private actors — not just states — across the full AI lifecycle. A structural innovation in international law.", type: "International", signal: "novel" },
  { date: "Aug 2024", headline: "EU AI Act enters into force", summary: "World's first comprehensive AI legal framework. Risk-tiered, phased implementation through 2027. The high-water mark in ex ante AI regulation globally.", type: "Legislative", signal: "active" },
];

const POV_QUESTIONS = [
  { id: "timing", question: "When should governance intervene?", framing: "The most fundamental fork in AI governance thinking. Ex ante governance gives more control but requires regulators to understand the technology in advance — which may be impossible. Ex post liability is more adaptive but may allow catastrophic harms to occur first.", options: [
    { id: "ex_ante", label: "Ex Ante — prevent before harm", desc: "Require approval before deployment. IRB model, FDA model, building permits. Slow but preventive. The EU AI Act's bet.", color: "#9B7EC8" },
    { id: "ex_post", label: "Ex Post — punish after harm", desc: "Let harm occur, then litigate. Adaptive and hard to capture, but may be too slow for fast-moving technology. The US legal tradition's default.", color: "#C8A96E" },
    { id: "both", label: "Both — calibrated to risk level", desc: "High-stakes domains (health, hiring, criminal justice) get ex ante review. Consumer applications get ex post liability. Risk-tiered and pragmatic.", color: "#8FB8AD" },
  ]},
  { id: "who", question: "Who should be the primary regulator?", framing: "Every actor in the governance stack has a different speed, legitimacy, and accountability. The realistic question isn't who is best — it's who can actually act in time and be trusted not to be captured.", options: [
    { id: "federal", label: "Federal government", desc: "Legitimacy and reach, but deep technical lag and high capture risk from the very industry being regulated.", color: "#C8A96E" },
    { id: "sector", label: "Sector regulators (FDA, FTC, SEC)", desc: "Already have domain expertise. Can adapt existing authority without new legislation. But coverage is fragmented by sector.", color: "#8FB8AD" },
    { id: "market", label: "Market forces + liability", desc: "Structure incentives through insurance, liability, and procurement requirements. No regulator needs to understand the tech. Risk: catastrophic harms are the price of discovery.", color: "#9B7EC8" },
    { id: "company", label: "Company-level governance", desc: "Fastest and most technically informed. No external accountability. The 'if we don't, China will' dynamic prevails.", color: "#D4736A" },
  ]},
  { id: "scope", question: "What should be regulated — and how?", framing: "Horizontal rules apply to all AI regardless of use. Vertical rules apply to specific domains. The choice shapes who bears the compliance burden and whether rules can keep pace with a fast-moving technology.", options: [
    { id: "horizontal", label: "Horizontal framework", desc: "One set of rules for all AI — like the EU AI Act. Comprehensive but risks being either too vague or too restrictive across diverse use cases.", color: "#C8A96E" },
    { id: "vertical", label: "Sector-by-sector rules", desc: "HIPAA for health AI, FINRA for financial AI, FEC for political AI. Targeted but creates governance gaps in unregulated sectors.", color: "#8FB8AD" },
    { id: "layer", label: "Layer-specific rules", desc: "Govern data, models, deployment, and runtime separately with different instruments. Architecturally precise, extremely hard to coordinate across jurisdictions.", color: "#9B7EC8" },
  ]},
  { id: "analogy", question: "Which historical analogy guides your thinking?", framing: "The analogy you choose shapes what you think is possible and where you focus energy. Each implies a different theory of change — and a different bet on where the first real governance breakthrough will come from.", options: [
    { id: "nuclear", label: "Nuclear arms control", desc: "Coordination between adversaries is achievable — but only once risk is legible and catastrophic. Focus on making AI risk measurable before attempting restrictions.", color: "#D4736A" },
    { id: "irb", label: "IRB / research ethics boards", desc: "Distributed, domain-embedded review. Embed governance in the institution closest to the decision. Scale accountability down, not up.", color: "#8FB8AD" },
    { id: "liability", label: "Products liability (MacPherson)", desc: "A single court case can restructure an entire industry's incentives. Prepare the doctrine now; wait for the MacPherson moment.", color: "#C8A96E" },
    { id: "building", label: "Building codes / chokepoints", desc: "Don't govern the technology — govern the gate. Focus on cloud providers, insurers, app stores. More tractable than governing models.", color: "#9B7EC8" },
  ]},
  { id: "urgency", question: "What's the right pace?", framing: "Fast rules are often too vague to be useful or too specific to survive the next model generation. But waiting means governing after catastrophic harms have already occurred — with a sympathetic plaintiff, a headline, and enormous political pressure to overreact.", options: [
    { id: "now", label: "Act now, imperfectly", desc: "Imperfect rules create accountability surfaces and establish that governance is legitimate. The EU AI Act will be wrong in many ways — but it establishes the principle.", color: "#D4736A" },
    { id: "legibility", label: "Invest in legibility first", desc: "Before restrictions, build measurement infrastructure: standardized evals, capability benchmarks, mandatory incident reporting. You cannot govern what you cannot measure.", color: "#8FB8AD" },
    { id: "wait", label: "Let the technology stabilize", desc: "Premature regulation locks in incumbents and forecloses alternatives. Wait for clearer harm patterns before mandating specific approaches.", color: "#C8A96E" },
  ]},
  { id: "civic", question: "What role do citizens have in governance?", framing: "AI was deployed to five billion people simultaneously — the largest uncontrolled experiment in history. Unlike every prior transformative technology, it required no license, no training, no civic onboarding. The question is whether citizens are only ever subjects of governance, or whether they are also agents of it.", options: [
    { id: "primary", label: "Citizens are primary — norms first", desc: "Behavioral norms, disclosure expectations, and civic literacy are the most adaptive governance layer. Law follows culture. Build the culture first.", color: "#E8C37A" },
    { id: "complement", label: "Civic norms complement law", desc: "Norms fill gaps law cannot reach — private conduct, contextual appropriateness, professional expectations. They don't replace law; they extend its reach.", color: "#7EC8A8" },
    { id: "marginal", label: "Citizens are marginal actors", desc: "Bad actors ignore norms by definition. Civic governance is aspirational and toothless without legal backstop. Focus institutional energy on law and liability.", color: "#C4A0F0" },
    { id: "education", label: "The real intervention is literacy", desc: "You cannot govern what you don't understand. The most leveraged civic investment is AI literacy — equipping citizens to participate meaningfully in governance debates and recognize harm when it occurs.", color: "#E07868" },
  ]},
];

const POV_SYNTHESIS = {
  "ex_ante+federal+horizontal+nuclear+now+primary": { title: "The Civic Precautionary", summary: "You believe governance must be both top-down and bottom-up simultaneously. Comprehensive federal rules set the floor; civic norms define the culture above it. You'd invest in both AI literacy programs and federal legislation, arguing that law without civic buy-in produces compliance theater.", color: "#9B7EC8" },
  "ex_ante+federal+horizontal+nuclear+now+complement": { title: "The Precautionary Regulator", summary: "You believe governance must get ahead of harm, even imperfectly. A comprehensive federal AI framework modeled on the EU AI Act, with civic norms filling the gaps law can't reach. Your core bet: the cost of waiting exceeds the cost of over-regulation.", color: "#9B7EC8" },
  "ex_post+market+vertical+liability+wait+marginal": { title: "The Liability Architect", summary: "You believe structured ex post liability is more adaptive and harder to capture than ex ante regulation. Civic norms are aspirational without legal teeth. Your priority: strip AI immunity shields, create clear liability surfaces, and let courts and insurance markets discipline behavior sector by sector.", color: "#C8A96E" },
  "both+sector+layer+irb+legibility+complement": { title: "The Pragmatic Institutionalist", summary: "You believe governance should be embedded in the institutions closest to the decision — distributed, domain-specific, focused on legibility before restriction. Civic norms extend institutional governance into private conduct. IRB models, sector regulators, mandatory disclosure, and professional community standards working in concert.", color: "#8FB8AD" },
  "ex_ante+sector+vertical+building+legibility+education": { title: "The Literacy-First Strategist", summary: "You believe the most leveraged investment is making citizens capable of participating in governance debates and recognizing harm. Chokepoint governance at the institutional level; AI literacy at the civic level. Neither can function without the other — technical governance needs a literate public to be legitimate.", color: "#E8C37A" },
  "both+sector+layer+irb+legibility+primary": { title: "The Norm Architect", summary: "You believe civic norms are the most adaptive governance layer and that law follows culture. You'd invest heavily in professional community standards, disclosure norms, and epistemic hygiene before pursuing legislation — arguing that durable governance requires cultural change, not just legal mandates.", color: "#7EC8A8" },
  "ex_post+market+vertical+liability+legibility+complement": { title: "The Infrastructure Realist", summary: "You believe governance works through existing infrastructure — liability, chokepoints, market incentives — with civic norms filling the gaps. Build legibility first, let liability follow, let culture evolve. Pragmatic and politically viable; the honest risk is that culture evolves more slowly than harm.", color: "#C8A96E" },
  "default": { title: "A Considered Mixed Position", summary: "Your answers reflect a nuanced, context-dependent view — different approaches for different layers, domains, risk levels, and civic contexts. That is probably the most defensible position intellectually, and the hardest to operationalize politically. The challenge: mixed positions require coordination across actors and instruments, which is itself a governance problem.", color: "#C8A96E" },
};

function getSynthesis(answers) {
  const key = [answers.timing, answers.who, answers.scope, answers.analogy, answers.urgency, answers.civic].join("+");
  return POV_SYNTHESIS[key] || POV_SYNTHESIS["default"];
}

const CSS = `
  ${FONTS}

  /*
    WCAG AA targets met throughout:
    Background #1C1A16 → primary text #F0EAD6: ~12:1
    Background #1C1A16 → secondary text #B8A888: ~5.2:1
    Background #1C1A16 → muted text #8A7F68: ~4.6:1
    Accent gold #E8C37A on #1C1A16: ~7.8:1 (well above 4.5:1 AA)
    Accent gold #E8C37A on dark button bg #0F0E0A: ~9:1
    Min font size: 12px labels, 14px body, 11px only for de-emphasized badge text
  */

  :root {
    --bg:        #1C1A16;
    --bg-card:   #242118;
    --bg-deep:   #161410;
    --border:    #3A3520;
    --border-hi: #544C30;
    --text-hi:   #F0EAD6;
    --text-body: #C8BA9A;
    --text-sec:  #B8A888;
    --text-muted:#8A7F68;
    --accent:    #E8C37A;
    --accent-dk: #1C1A16;
    --green:     #7EC8A8;
    --purple:    #A888D8;
    --red:       #E07868;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text-hi); font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.6; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg-deep); }
  ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 3px; }

  .app { min-height: 100vh; }

  /* ── Header ── */
  .header {
    border-bottom: 1px solid var(--border);
    padding: 20px 40px 0;
    position: sticky; top: 0; z-index: 100;
    background: rgba(28,26,22,0.97);
    backdrop-filter: blur(12px);
  }
  .header-top { margin-bottom: 14px; }
  .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 4px;
  }
  .h-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text-hi); }
  .h-title em { font-style: italic; color: var(--accent); }
  .h-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; font-family: 'DM Mono', monospace; line-height: 1.5; }
  .nav { display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .nav::-webkit-scrollbar { display: none; }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted); padding: 10px 18px 14px;
    border-bottom: 2px solid transparent; transition: all 0.2s;
    white-space: nowrap; flex-shrink: 0;
  }
  .nav-btn:hover { color: var(--accent); }
  .nav-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* ── Content ── */
  .content { padding: 32px 40px; max-width: 1080px; margin: 0 auto; }

  .sec-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--text-hi); margin-bottom: 8px; }
  .sec-title em { font-style: italic; color: var(--accent); }
  .sec-desc { color: var(--text-sec); font-size: 14px; line-height: 1.75; max-width: 620px; margin-bottom: 26px; }
  .mono { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }

  /* ── Layers ── */
  .layers { display: grid; gap: 3px; margin-bottom: 32px; }
  .lrow {
    display: grid; grid-template-columns: 160px 1fr 82px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.2s;
  }
  .lrow:hover { border-color: var(--border-hi); background: #28241C; }
  .lrow.open { background: #28241C; }
  .llabel { padding: 18px 16px; border-right: 1px solid var(--border); }
  .lname { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .lsub { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); letter-spacing: 0.03em; line-height: 1.4; }
  .lbody { padding: 18px; }
  .ltags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
  .ltag {
    font-family: 'DM Mono', monospace; font-size: 11px; padding: 3px 8px;
    border-radius: 3px; background: var(--bg-deep); color: var(--text-sec);
    border: 1px solid var(--border);
  }
  .ldesc { font-size: 14px; color: var(--text-body); line-height: 1.7; margin-top: 8px; }
  .lhint { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
  .lgap { display: flex; align-items: center; justify-content: center; border-left: 1px solid var(--border); padding: 12px 8px; }
  .lgap-inner { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; writing-mode: vertical-rl; text-align: center; line-height: 1.3; font-weight: 600; }

  /* ── Tension cards ── */
  .tension { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
  .tcard { padding: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; }
  .tcard-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .tcard-body { font-size: 14px; color: var(--text-body); line-height: 1.75; }

  /* ── Actors ── */
  .agrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
  .acard {
    padding: 14px 10px; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 4px; text-align: center; transition: border-color 0.2s;
  }
  .acard:hover { border-color: var(--accent); }
  .aicon { font-size: 20px; margin-bottom: 6px; }
  .alabel { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 5px; font-weight: 500; }
  .arole { font-size: 12px; color: var(--text-sec); line-height: 1.45; }
  .alag { margin-top: 8px; font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); }

  /* ── Callout ── */
  .callout { padding: 20px 22px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; margin-top: 12px; }
  .callout-body { font-size: 14px; color: var(--text-body); line-height: 1.8; }

  /* ── Toolkit ── */
  .filters { display: flex; gap: 6px; margin-bottom: 20px; }
  .fbtn {
    background: var(--bg-card); border: 1px solid var(--border); cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-sec); padding: 6px 14px;
    border-radius: 3px; transition: all 0.15s;
  }
  .fbtn:hover { color: var(--accent); border-color: var(--accent); }
  .fbtn.on { color: var(--accent-dk); background: var(--accent); border-color: var(--accent); font-weight: 600; }

  .igrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .icard {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 4px; padding: 18px; cursor: pointer; transition: all 0.2s;
  }
  .icard:hover { border-color: var(--border-hi); background: #28241C; }
  .icard.open { background: #28241C; }
  .itop { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .iera { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); letter-spacing: 0.07em; }
  .itag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.05em; padding: 3px 8px; border-radius: 3px; font-weight: 500; }
  .iname { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; margin-bottom: 3px; line-height: 1.2; color: var(--text-hi); }
  .iorigin { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono', monospace; margin-bottom: 10px; }
  .itypes { display: flex; gap: 6px; margin-bottom: 10px; }
  .tbadge { font-family: 'DM Mono', monospace; font-size: 11px; padding: 3px 8px; border-radius: 3px; letter-spacing: 0.04em; font-weight: 500; }
  .ex_ante { background: rgba(168,136,216,0.18); color: #C4A0F0; border: 1px solid rgba(168,136,216,0.3); }
  .ex_post  { background: rgba(232,195,122,0.18); color: var(--accent); border: 1px solid rgba(232,195,122,0.3); }
  .imech { font-size: 14px; color: var(--text-body); line-height: 1.7; margin-bottom: 10px; }
  .iai {
    font-size: 13px; color: #A8D8C0; line-height: 1.7;
    padding: 12px 14px; background: rgba(126,200,168,0.1);
    border-left: 3px solid var(--green); border-radius: 3px; margin-bottom: 8px;
  }
  .iweak {
    font-size: 13px; color: #D4A898; line-height: 1.7;
    padding: 10px 14px; background: rgba(224,120,104,0.1);
    border-left: 3px solid var(--red); border-radius: 3px;
  }
  .ihint { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); margin-top: 10px; }
  .srow { display: flex; gap: 4px; align-items: center; margin-top: 10px; }
  .slbl { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); margin-right: 6px; letter-spacing: 0.05em; }
  .sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
  .sdot.on { background: var(--accent); }

  /* ── Tracker ── */
  .tlist { display: grid; gap: 6px; margin-bottom: 32px; }
  .lcard {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 4px; overflow: hidden; cursor: pointer; transition: border-color 0.2s;
  }
  .lcard:hover { border-color: var(--border-hi); }
  .lcard.open { border-color: var(--accent); }
  .lcard-header { display: grid; grid-template-columns: 110px 200px 1fr 96px; gap: 16px; align-items: center; padding: 14px 18px; }
  .ldate { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-sec); line-height: 1.4; }
  .lname { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; margin-bottom: 5px; line-height: 1.25; color: var(--text-hi); }
  .ltags2 { display: flex; gap: 4px; flex-wrap: wrap; }
  .lsum { font-size: 13px; color: var(--text-sec); line-height: 1.55; }
  .sbadge {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.07em;
    padding: 4px 10px; border-radius: 3px; text-align: center;
    text-transform: uppercase; font-weight: 600;
    white-space: nowrap;
  }
  .ldetail { padding: 16px 18px 20px; border-top: 1px solid var(--border); background: var(--bg-deep); }
  .ldetail-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--text-hi); }
  .ldetail-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .ldetail-body { font-size: 14px; color: var(--text-body); line-height: 1.75; }
  .src-link {
    display: inline-block; margin-top: 12px;
    font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.07em;
    color: var(--accent); text-decoration: none;
    border-bottom: 1px solid rgba(232,195,122,0.4);
    padding-bottom: 1px;
  }
  .src-link:hover { border-bottom-color: var(--accent); }

  /* ── News ── */
  .nlist { display: grid; gap: 0; }
  .nitem { display: grid; grid-template-columns: 76px 1fr 90px; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--border); align-items: start; }
  .ndate { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-sec); padding-top: 2px; line-height: 1.4; }
  .nhead { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; margin-bottom: 5px; color: var(--text-hi); }
  .nbody { font-size: 13px; color: var(--text-sec); line-height: 1.6; }
  .ntype { display: inline-block; margin-top: 7px; }
  .nsig { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.07em; padding: 4px 9px; border-radius: 3px; text-align: center; text-transform: uppercase; font-weight: 600; }

  .divider { height: 1px; background: var(--border); margin: 32px 0; }

  /* ── POV ── */
  .pov-prog { display: flex; gap: 5px; margin-bottom: 26px; }
  .pdot { height: 3px; flex: 1; background: var(--border); border-radius: 2px; transition: background 0.3s; }
  .pdot.done { background: var(--accent); }
  .pdot.cur { background: rgba(232,195,122,0.5); }

  .pov-intro { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 24px; margin-bottom: 26px; }
  .pov-intro-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--text-hi); }
  .pov-intro-body { font-size: 14px; color: var(--text-body); line-height: 1.8; }

  .pov-q { margin-bottom: 26px; }
  .pov-qnum { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
  .pov-qtext { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text-hi); margin-bottom: 6px; }
  .pov-qframe { font-size: 14px; color: var(--text-body); line-height: 1.7; margin-bottom: 18px; }
  .pov-opts { display: grid; gap: 8px; }
  .popt {
    display: grid; grid-template-columns: 20px 1fr; gap: 14px; align-items: start;
    padding: 15px 16px; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 4px; cursor: pointer; transition: all 0.2s;
  }
  .popt:hover { border-color: var(--border-hi); background: #28241C; }
  .popt.chosen { background: #28241C; }
  .popt-dot {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-hi);
    margin-top: 2px; flex-shrink: 0; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .popt-inner { width: 9px; height: 9px; border-radius: 50%; }
  .popt-lbl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 3px; }
  .popt-desc { font-size: 13px; color: var(--text-sec); line-height: 1.55; }
  .pov-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; }
  .pbtn {
    background: none; border: 1px solid var(--border-hi); cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-sec); padding: 9px 18px;
    border-radius: 3px; transition: all 0.2s;
  }
  .pbtn:hover { color: var(--accent); border-color: var(--accent); }
  .pbtn.primary { background: var(--accent); color: var(--accent-dk); border-color: var(--accent); font-weight: 700; }
  .pbtn.primary:hover { background: #F0CF90; }
  .pbtn:disabled { opacity: 0.3; cursor: not-allowed; }

  .pov-result { animation: fi 0.4s ease; }
  @keyframes fi { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .pov-rcard { padding: 26px; border-radius: 4px; border: 1px solid; margin-bottom: 22px; }
  .pov-rlabel { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; }
  .pov-rtitle { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; margin-bottom: 12px; }
  .pov-rbody { font-size: 14px; line-height: 1.8; color: var(--text-body); }
  .pov-answers { display: grid; gap: 7px; }
  .pov-arow { display: grid; grid-template-columns: 180px 1fr; gap: 12px; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; align-items: start; }
  .pov-aq { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); line-height: 1.5; }
  .pov-aa { font-size: 14px; color: var(--accent); font-weight: 600; }
  .prestart {
    background: none; border: 1px solid var(--border-hi); cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-sec); padding: 8px 16px;
    border-radius: 3px; transition: all 0.2s; margin-top: 16px;
  }
  .prestart:hover { color: var(--accent); border-color: var(--accent); }

  @media (max-width: 760px) {
    .content { padding: 22px 18px; }
    .header { padding: 16px 18px 0; }
    .igrid, .tension { grid-template-columns: 1fr; }
    .agrid { grid-template-columns: repeat(3, 1fr); }
    .lcard-header { grid-template-columns: 1fr; gap: 8px; }
    .lrow { grid-template-columns: 1fr; }
    .pov-arow { grid-template-columns: 1fr; gap: 3px; }
    .civic-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
    .norm-grid { grid-template-columns: 1fr !important; }
    .stick-grid { grid-template-columns: 1fr !important; }

    /* tracker: stack signal badge below summary on mobile */
    .lcard-header { display: flex; flex-direction: column; align-items: flex-start; }
    .sbadge { font-size: 10px; letter-spacing: 0.04em; padding: 3px 8px; }

    /* news: hide signal badge column, show inline */
    .nitem { grid-template-columns: 60px 1fr; }
    .nitem > div:last-child { display: none; }
    .nsig { display: none; }

    /* civic banner padding */
    .civic-banner { padding: 22px 20px; }
    .civic-headline { font-size: 22px; }

    /* POV options */
    .pov-opts { gap: 6px; }
    .popt { padding: 12px 13px; }
  }

  /* ── Civic Layer ── */
  .civic-banner {
    background: linear-gradient(135deg, #1E1B14 0%, #241F16 60%, #1E1B14 100%);
    border: 1px solid var(--border-hi); border-radius: 6px;
    padding: 32px 36px; margin-bottom: 32px; position: relative; overflow: hidden;
  }
  .civic-banner::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,195,122,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .civic-eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
  .civic-headline { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: var(--text-hi); line-height: 1.15; margin-bottom: 14px; }
  .civic-headline em { font-style: italic; color: var(--accent); }
  .civic-lead { font-size: 15px; color: var(--text-body); line-height: 1.8; max-width: 680px; }

  .civic-stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 32px; }
  .civic-stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 18px 16px; }
  .civic-stat-num { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: 6px; }
  .civic-stat-label { font-size: 12px; color: var(--text-sec); line-height: 1.5; }
  .civic-stat-note { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-muted); margin-top: 6px; letter-spacing: 0.03em; }

  .civic-section-head { margin-bottom: 20px; }
  .civic-section-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--text-hi); margin-bottom: 5px; }
  .civic-section-desc { font-size: 13px; color: var(--text-sec); line-height: 1.65; max-width: 640px; }

  .lineage-row { display: grid; gap: 3px; margin-bottom: 32px; }
  .lineage-item { display: grid; grid-template-columns: 72px 1fr; gap: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
  .lineage-year { display: flex; align-items: center; justify-content: center; padding: 14px 10px; border-right: 1px solid var(--border); background: var(--bg-deep); }
  .lineage-year-text { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--accent); text-align: center; line-height: 1.2; }
  .lineage-body { padding: 14px 16px; }
  .lineage-title { font-size: 14px; font-weight: 600; color: var(--text-hi); margin-bottom: 3px; }
  .lineage-desc { font-size: 13px; color: var(--text-sec); line-height: 1.55; }
  .lineage-lesson { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--accent); margin-top: 5px; letter-spacing: 0.02em; }

  .norm-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 32px; }
  .norm-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
  .norm-card:hover { border-color: var(--border-hi); }
  .norm-card.open { border-color: var(--accent); }
  .norm-card-header { padding: 18px; }
  .norm-cat { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; }
  .norm-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text-hi); margin-bottom: 4px; line-height: 1.2; }
  .norm-oneliner { font-size: 13px; color: var(--text-sec); line-height: 1.5; }
  .norm-expand { padding: 0 18px 18px; border-top: 1px solid var(--border); }
  .norm-expand-inner { padding-top: 16px; display: grid; gap: 12px; }
  .norm-field { font-size: 13px; color: var(--text-body); line-height: 1.65; }
  .norm-field-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 5px; }
  .norm-analog { font-size: 13px; color: var(--text-body); line-height: 1.6; font-style: italic; padding: 10px 14px; background: var(--bg-deep); border-radius: 3px; border-left: 3px solid var(--border-hi); }
  .norm-emerging { font-size: 12px; color: #7EC8A8; line-height: 1.55; padding: 8px 12px; background: rgba(126,200,168,0.08); border-radius: 3px; border-left: 2px solid rgba(126,200,168,0.4); }
  .norm-barrier { font-size: 12px; color: #E07868; line-height: 1.55; padding: 8px 12px; background: rgba(224,120,104,0.08); border-radius: 3px; border-left: 2px solid rgba(224,120,104,0.4); }
  .norm-hint { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-muted); padding: 12px 18px 14px; }

  .stick-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 32px; }
  .stick-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 18px; }
  .stick-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
  .stick-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--text-hi); margin-bottom: 8px; }
  .stick-body { font-size: 13px; color: var(--text-body); line-height: 1.7; }
  .stick-ai { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-style: italic; }

  .honest-tension { background: linear-gradient(135deg, rgba(224,120,104,0.06) 0%, rgba(232,195,122,0.04) 100%); border: 1px solid rgba(232,195,122,0.2); border-radius: 4px; padding: 22px 24px; margin-top: 8px; }
  .honest-tension-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: var(--text-hi); margin-bottom: 10px; }
  .honest-tension-body { font-size: 14px; color: var(--text-body); line-height: 1.8; }
`;

export default function App() {
  const [tab, setTab] = useState("map");
  const [openLayer, setOpenLayer] = useState(null);
  const [openInv, setOpenInv] = useState(null);
  const [openLaw, setOpenLaw] = useState(null);
  const [filter, setFilter] = useState("all");

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <div className="eyebrow">A Field Guide</div>
            <div className="h-title">Who Governs <em>The Machine?</em></div>
            <div className="h-sub">AI governance & compliance — intervention points, historical toolkit, live tracker, and a framework for building your own position</div>
          </div>
          <nav className="nav">
            {[{id:"map",l:"I. Intervention Map"},{id:"toolkit",l:"II. Legal Layer"},{id:"civic",l:"III. Civic Layer"},{id:"tracker",l:"IV. Live Tracker"},{id:"pov",l:"V. Build Your POV"}].map(t =>
              <button key={t.id} className={`nav-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
            )}
          </nav>
        </header>
        <main className="content">
          {tab==="map" && <MapTab openLayer={openLayer} setOpenLayer={setOpenLayer}/>}
          {tab==="toolkit" && <ToolkitTab openInv={openInv} setOpenInv={setOpenInv} filter={filter} setFilter={setFilter}/>}
          {tab==="tracker" && <TrackerTab openLaw={openLaw} setOpenLaw={setOpenLaw}/>}
          {tab==="civic" && <CivicTab/>}
          {tab==="pov" && <PovTab/>}
        </main>
      </div>
    </>
  );
}

function MapTab({openLayer, setOpenLayer}) {
  return (
    <div>
      <div className="sec-title">Where can governance <em>intervene?</em></div>
      <div className="sec-desc">"AI governance" is too vague to be useful. Every serious intervention must target a specific layer of the stack — and each layer has a different governance surface, actors, and gap. Click any layer to expand.</div>
      <div className="layers">
        {INTERVENTION_LAYERS.map(layer => {
          const open = openLayer===layer.id;
          return (
            <div key={layer.id} className={`lrow ${open?"open":""}`} style={{borderColor: open ? layer.color+"33" : undefined}} onClick={()=>setOpenLayer(open?null:layer.id)}>
              <div className="llabel">
                <div className="lname" style={{color:layer.color}}>{layer.label}</div>
                <div className="lsub">{layer.sublabel}</div>
              </div>
              <div className="lbody">
                <div className="ltags">{layer.examples.map(e=><span key={e} className="ltag">{e}</span>)}</div>
                {open ? <div className="ldesc">{layer.description}</div> : <div className="lhint">↓ click to expand</div>}
              </div>
              <div className="lgap">
                <div className="lgap-inner" style={{color:layer.gapColor}}>{layer.govGap}<br/><span style={{fontSize:"9px",opacity:0.7}}>GAP</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mono" style={{marginBottom:"12px"}}>The Key Structural Tension</div>
      <div className="tension">
        <div className="tcard" style={{borderColor:"rgba(168,136,216,0.25)"}}>
          <div className="tcard-title" style={{color:"#C4A0F0"}}>Ex Ante Governance</div>
          <div className="tcard-body">You must get approval <em>before</em> deploying. Like FDA drug trials or IRB review. Requires regulators to understand the technology in advance. Risk: regulatory lag and capture. Benefit: prevents harm before it occurs.</div>
        </div>
        <div className="tcard" style={{borderColor:"rgba(232,195,122,0.25)"}}>
          <div className="tcard-title" style={{color:"#E8C37A"}}>Ex Post Liability</div>
          <div className="tcard-body">You are liable for harm <em>after</em> the fact. Like tort law and product liability. Adaptive and hard to capture. The US legal tradition's strong default. Current gap: AI companies face minimal liability today.</div>
        </div>
      </div>

      <div className="mono" style={{marginBottom:"12px"}}>Who Governs? — The Actor Stack</div>
      <div className="agrid">
        {ACTORS.map(a=>(
          <div key={a.id} className="acard">
            <div className="aicon">{a.icon}</div>
            <div className="alabel">{a.label}</div>
            <div className="arole">{a.role}</div>
            <div className="alag">Lag: {a.lag}</div>
          </div>
        ))}
      </div>
      <div className="callout" style={{marginTop:"12px"}}>
        <div className="callout-body">The actors with the lowest lag — companies and individuals — have the highest incentive to move fast and the least external accountability. The actors with the most legitimate authority — states, federal government — lag the technology by years. In the fray of the AI boom, governance decisions fall to engineers, product managers, and executives. <span style={{color:"#E8C37A"}}>Everyone in the room needs a framework.</span></div>
      </div>
    </div>
  );
}

function ToolkitTab({openInv, setOpenInv, filter, setFilter}) {
  const shown = LEGAL_INVENTIONS.filter(i => filter==="all" || i.type===filter);
  return (
    <div>
      <div className="sec-title">Law as <em>technology</em></div>
      <div className="sec-desc">Every legal structure we have was invented to solve a coordination problem. Property rights, limited liability, the IRB, the NPT — novel responses to novel failures. These are the building blocks history offers for AI governance. Click any card to reveal the AI application and the disanalogy.</div>
      <div className="filters">
        {[{id:"all",l:"All"},{id:"ex_ante",l:"Ex Ante"},{id:"ex_post",l:"Ex Post"}].map(f=>
          <button key={f.id} className={`fbtn ${filter===f.id?"on":""}`} onClick={()=>setFilter(f.id)}>{f.l}</button>
        )}
      </div>
      <div className="igrid">
        {shown.map(inv=>{
          const open = openInv===inv.id;
          return (
            <div key={inv.id} className={`icard ${open?"open":""}`} style={{borderColor:open?inv.tagColor+"2a":undefined}} onClick={()=>setOpenInv(open?null:inv.id)}>
              <div className="itop">
                <div className="iera">{inv.era}</div>
                <div className="itag" style={{background:inv.tagColor+"16",color:inv.tagColor}}>{inv.tag}</div>
              </div>
              <div className="iname">{inv.name}</div>
              <div className="iorigin">{inv.origin}</div>
              <div className="itypes"><span className={`tbadge ${inv.type}`}>{inv.type==="ex_ante"?"Ex Ante":"Ex Post"}</span></div>
              <div className="imech">{inv.mechanism}</div>
              {open && <>
                <div className="iai"><div className="mono" style={{color:"#7EC8A8",marginBottom:"6px"}}>AI Application →</div>{inv.aiMapping}</div>
                <div className="iweak"><div className="mono" style={{color:"#E07868",marginBottom:"6px"}}>Disanalogy / Weakness →</div>{inv.weakness}</div>
              </>}
              {!open && <div className="ihint">↓ click for AI application & disanalogy</div>}
              <div className="srow">
                <span className="slbl">AI FIT</span>
                {[1,2,3,4,5].map(n=><div key={n} className={`sdot ${n<=inv.strength?"on":""}`}/>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackerTab({openLaw, setOpenLaw}) {
  const [trackerFilter, setTrackerFilter] = useState("all");

  const sigStyle = {
    "🟢":{bg:"rgba(126,200,168,0.15)",color:"#7EC8A8"},
    "🟡":{bg:"rgba(232,195,122,0.15)",color:"#E8C37A"},
    "🟠":{bg:"rgba(224,148,80,0.15)",color:"#E09450"},
    "🔴":{bg:"rgba(224,120,104,0.15)",color:"#E07868"},
  };
  const newsStyle = {
    deregulatory:{bg:"rgba(224,120,104,0.15)",color:"#E07868"},
    softening:{bg:"rgba(232,195,122,0.15)",color:"#E8C37A"},
    active:{bg:"rgba(126,200,168,0.15)",color:"#7EC8A8"},
    novel:{bg:"rgba(196,160,240,0.15)",color:"#C4A0F0"},
    soft:{bg:"rgba(232,195,122,0.15)",color:"#E8C37A"},
  };

  const filteredLandscape = trackerFilter === "civic"
    ? CURRENT_LANDSCAPE.filter(l => l.civic)
    : trackerFilter === "legal"
    ? CURRENT_LANDSCAPE.filter(l => !l.civic)
    : CURRENT_LANDSCAPE;

  const filteredNews = trackerFilter === "civic"
    ? NEWS_ITEMS.filter(n => n.type === "Civic")
    : trackerFilter === "legal"
    ? NEWS_ITEMS.filter(n => n.type !== "Civic")
    : NEWS_ITEMS;

  return (
    <div>
      <div className="sec-title">The patchwork, <em>mapped</em></div>
      <div className="sec-desc">AI governance is not a coherent system — it's a collision of regulatory traditions, jurisdictions, and instruments. Some ex ante, some ex post, some entirely voluntary. Here's where things stand as of early 2026. Click any row for detail.</div>

      <div className="filters" style={{marginBottom:"20px"}}>
        {[{id:"all",l:"All"},{id:"legal",l:"Legal & Regulatory"},{id:"civic",l:"Civic & Civil Society"}].map(f=>
          <button key={f.id} className={`fbtn ${trackerFilter===f.id?"on":""}`} onClick={()=>setTrackerFilter(f.id)}>{f.l}</button>
        )}
      </div>

      <div className="tlist">
        {filteredLandscape.map(law=>{
          const sc = sigStyle[law.signal]||{bg:"rgba(184,168,136,0.15)",color:"#B8A888"};
          const open = openLaw===law.id;
          return (
            <div key={law.id} className={`lcard ${open?"open":""}`} onClick={()=>setOpenLaw(open?null:law.id)}>
              <div className="lcard-header">
                <div className="ldate">{law.date.split(";")[0]}</div>
                <div>
                  <div className="lname">
                    {law.name}
                    {law.civic && <span style={{marginLeft:"8px",fontFamily:"'DM Mono', monospace",fontSize:"9px",letterSpacing:"0.1em",padding:"2px 7px",borderRadius:"10px",background:"rgba(126,200,168,0.15)",color:"#7EC8A8",verticalAlign:"middle"}}>CIVIC</span>}
                  </div>
                  <div className="ltags2">
                    {law.layer.map(l=>{const ld=INTERVENTION_LAYERS.find(il=>il.id===l);return <span key={l} className="ltag" style={{color:ld?.color}}>{ld?.label||l}</span>;})}
                    <span className={`ltag tbadge ${law.approach}`}>{law.approach==="ex_ante"?"Ex Ante":"Ex Post"}</span>
                  </div>
                </div>
                <div className="lsum">{law.summary}</div>
                <div><div className="sbadge" style={{background:sc.bg,color:sc.color}}>{law.signalLabel}</div></div>
              </div>
              {open && (
                <div className="ldetail">
                  <div className="ldetail-title">{law.name}</div>
                  <div className="ldetail-meta">
                    <span className="mono">Type: {law.type}</span>
                    <span className="mono">Status: {law.status}</span>
                    <span className="mono">{law.jurisdiction}</span>
                  </div>
                  <div className="ldetail-body">{law.summary}</div>
                  {law.url && <a href={law.url} target="_blank" rel="noopener noreferrer" className="src-link">Primary source →</a>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="divider"/>
      <div className="sec-title" style={{fontSize:"22px",marginBottom:"4px"}}>Recent Developments</div>
      <div className="sec-desc" style={{marginBottom:"16px"}}>The regulatory and civic signal worth tracking, most recent first.</div>
      <div className="nlist">
        {filteredNews.map((item,i)=>{
          const s = newsStyle[item.signal]||{bg:"rgba(184,168,136,0.15)",color:"#B8A888"};
          const isCivic = item.type === "Civic";
          return (
            <div key={i} className="nitem">
              <div className="ndate">{item.date}</div>
              <div>
                <div className="nhead">{item.headline}</div>
                <div className="nbody">{item.summary}</div>
                <span className="ltag ntype" style={isCivic ? {color:"#7EC8A8",borderColor:"rgba(126,200,168,0.3)"} : {}}>{item.type}</span>
              </div>
              <div><div className="nsig" style={{background:s.bg,color:s.color}}>{item.signal}</div></div>
            </div>
          );
        })}
      </div>
      <div className="divider"/>
      <div className="callout">
        <div className="mono" style={{marginBottom:"10px"}}>The Big Picture</div>
        <div style={{fontFamily:"'Playfair Display', serif",fontSize:"18px",fontWeight:"700",color:"#F0EAD6",marginBottom:"10px",lineHeight:"1.4"}}>"The most important AI governance innovation may not come from Congress or the EU."</div>
        <div className="callout-body">It may come from a single tort case, a novel insurance product, or an industry standard quietly incorporated into a vendor contract. <span style={{color:"#E8C37A"}}>Governance often crystallizes around the first serious harm that is legible, attributable, and has a sympathetic plaintiff.</span> That case — whatever it turns out to be — may matter more than any legislation currently being drafted.</div>
      </div>
    </div>
  );
}

function PovTab() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const total = POV_QUESTIONS.length;
  const currentQ = step>=1 && step<=total ? POV_QUESTIONS[step-1] : null;
  const done = step > total;
  const synth = done ? getSynthesis(answers) : null;

  return (
    <div>
      <div className="sec-title">Build Your <em>POV</em></div>
      <div className="sec-desc">AI governance is a domain where you need a position — not just awareness. Five questions, each representing a genuine fork. There are no correct answers, but some are more defensible than others.</div>

      {!done && (
        <div className="pov-prog">
          {POV_QUESTIONS.map((_,i)=><div key={i} className={`pdot ${i<step-1?"done":i===step-1?"cur":""}`}/>)}
        </div>
      )}

      {step===0 && (
        <div>
          <div className="pov-intro">
            <div className="pov-intro-title">Five forks. One position.</div>
            <div className="pov-intro-body">You've seen the intervention layers. You've seen the historical toolkit. You've tracked the current landscape. Now: take a position. Each question represents a genuine fork where thoughtful people who've studied this problem disagree. Your answers synthesize into a governance stance you can defend in a room.<br/><br/>The difference between being <em style={{color:"#E8C37A"}}>informed about</em> AI governance and having a <em style={{color:"#E8C37A"}}>point of view on</em> it is exactly this: the willingness to make a bet.</div>
          </div>
          <button className="pbtn primary" onClick={()=>setStep(1)}>Begin →</button>
        </div>
      )}

      {currentQ && !done && (
        <div className="pov-q">
          <div className="pov-qnum">Question {step} of {total}</div>
          <div className="pov-qtext">{currentQ.question}</div>
          <div className="pov-qframe">{currentQ.framing}</div>
          <div className="pov-opts">
            {currentQ.options.map(opt=>{
              const chosen = answers[currentQ.id]===opt.id;
              return (
                <div key={opt.id} className={`popt ${chosen?"chosen":""}`}
                  style={{borderColor:chosen?opt.color+"88":undefined}}
                  onClick={()=>setAnswers(p=>({...p,[currentQ.id]:opt.id}))}>
                  <div className="popt-dot" style={{borderColor:chosen?opt.color:"#544C30"}}>
                    {chosen && <div className="popt-inner" style={{background:opt.color}}/>}
                  </div>
                  <div>
                    <div className="popt-lbl" style={{color:chosen?opt.color:"#F0EAD6"}}>{opt.label}</div>
                    <div className="popt-desc">{opt.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pov-nav">
            <button className="pbtn" onClick={()=>setStep(s=>Math.max(0,s-1))}>← Back</button>
            <button className="pbtn primary" disabled={!answers[currentQ.id]} onClick={()=>setStep(s=>s+1)}>
              {step===total?"See my position →":"Next →"}
            </button>
          </div>
        </div>
      )}

      {done && synth && (
        <div className="pov-result">
          <div className="pov-rcard" style={{background:synth.color+"18",borderColor:synth.color+"55"}}>
            <div className="pov-rlabel" style={{color:synth.color}}>Your governance stance</div>
            <div className="pov-rtitle" style={{color:synth.color}}>{synth.title}</div>
            <div className="pov-rbody">{synth.summary}</div>
          </div>
          <div className="mono" style={{marginBottom:"12px"}}>Your answers</div>
          <div className="pov-answers">
            {POV_QUESTIONS.map(q=>{
              const opt = q.options.find(o=>o.id===answers[q.id]);
              return (
                <div key={q.id} className="pov-arow">
                  <div className="pov-aq">{q.question}</div>
                  <div className="pov-aa">{opt?.label||"—"}</div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:"22px",padding:"18px 20px",background:"#242118",border:"1px solid #3A3520",borderRadius:"4px"}}>
            <div className="mono" style={{marginBottom:"10px"}}>A note on positions</div>
            <div style={{fontSize:"14px",color:"#C8BA9A",lineHeight:"1.8"}}>Any defensible governance position should be able to answer three challenges: <span style={{color:"#E8C37A"}}>(1) What harm are you most afraid of, and why?</span> <span style={{color:"#7EC8A8"}}>(2) Who are you trusting to get this right, and why do they deserve that trust?</span> <span style={{color:"#C4A0F0"}}>(3) What would have to be true for you to change your mind?</span> If you can answer all three, you have a position. If you can't, you have a preference.</div>
          </div>
          <button className="prestart" onClick={()=>{setStep(0);setAnswers({});}}>↩ Start over</button>
        </div>
      )}
    </div>
  );
}

// ─── CIVIC DATA ──────────────────────────────────────────────────────────────

const LINEAGE = [
  { year: "1690s", title: "The Pamphlet Wars & Press Ethics", desc: "The printing press gave anyone with money access to mass persuasion. Anonymous pamphleteers spread fabrications freely. Norms about sourcing, attribution, and authorship emerged over decades — not from law, but from readers learning to distrust unsigned work.", lesson: "Lesson: legibility norms preceded press law by generations." },
  { year: "1919", title: "'Don't Yell Fire' — Schenck v. US", desc: "Justice Holmes established that free speech has contextual limits based on foreseeable harm in a specific environment. The crowded theater creates a duty of care in the speaker. Intent is secondary; predictable consequence in a shared space is the standard.", lesson: "Lesson: the shared environment creates civic obligation." },
  { year: "1960s", title: "The Highway Safety Movement", desc: "Cars had been legal for decades before Ralph Nader's Unsafe at Any Speed and the subsequent seatbelt campaigns. Behavioral norms (wear your belt, don't drink and drive) preceded legal mandates by years. Social stigma moved faster than legislation.", lesson: "Lesson: norm change from visible harm outpaces legislative cycles." },
  { year: "1980s", title: "MADD and Drunk Driving", desc: "Drunk driving was technically illegal but socially tolerated. Mothers Against Drunk Driving transformed it from a misfortune into a moral failure — a stigmatized choice, not an accident. Conviction rates tripled within a decade of the norm shift.", lesson: "Lesson: moral reframing by organized citizens reshapes enforcement." },
  { year: "1990s", title: "Spam & Email Norms", desc: "The norm against unsolicited bulk email ('spam') crystallized years before CAN-SPAM (2003). The internet community developed opprobrium, blocklists, and reputational sanctions long before law caught up. The community with authority was the technical community itself.", lesson: "Lesson: communities closest to the technology set early norms." },
  { year: "2010s", title: "Social Media & the 'Share' Norm", desc: "A decade of misinformation produced weak but real behavioral norms: check before you share, don't amplify without reading. These norms are fragile, uneven, and contested — but they exist. Platforms codified them into friction-adding design. Still insufficient.", lesson: "Lesson: norm emergence is possible but takes repeated, visible harm." },
  { year: "2022–", title: "Generative AI: The Uncontrolled Experiment", desc: "ChatGPT reached 100 million users in 60 days — faster than any technology in history. No licensing. No onboarding. No civic education. No consent mechanism. No behavioral norms inherited from prior use. 5 billion internet users became simultaneous test subjects. No prior technology was deployed this way.", lesson: "The gap: we are inventing norms in real time, under pressure, at scale." },
];

const NORMS = [
  {
    id: "disclosure",
    cat: "Transparency",
    catColor: "#E8C37A",
    name: "Disclose AI Authorship",
    oneliner: "Say when a machine wrote it, made it, or decided it.",
    full: "When AI materially generated content that will be read, heard, or acted upon by another person — say so. This includes written communications, images, data analyses, and decisions. The disclosure doesn't need to be elaborate, but it needs to exist.",
    analog: "Analogous to: declaring a conflict of interest, identifying as a recording artist vs. a live performer, stamping 'Advertisement' on paid content. We require disclosure in these contexts because the receiver's judgment depends on knowing the source.",
    emerging: "Already emerging: academic integrity policies, journalism ethics guidelines, LinkedIn's AI content labels, legal filings requiring AI disclosure in some courts. The norm is ahead of the law in professional communities.",
    barrier: "What's resisting it: disclosure creates friction in a competitive environment. If my competitor doesn't disclose and I do, I may be disadvantaged. This is a classic collective action problem — norms require near-universal adoption to function.",
  },
  {
    id: "chainofcustody",
    cat: "Information Integrity",
    catColor: "#7EC8A8",
    name: "Flag Before You Forward",
    oneliner: "Don't pass AI-generated content into a chain of trust without marking it.",
    full: "When you share, forward, quote, or cite AI-generated content — especially in professional or civic contexts — flag its origin. The norm is not about judgment of the content, but about maintaining chain of custody in information systems. Once AI content is laundered through human re-sharing, it becomes invisible as such.",
    analog: "Analogous to: the norm against forwarding unverified news ('check Snopes first'), citation practices in academia, hearsay rules in law. We have infrastructure for attributing human sources; we need equivalent infrastructure for AI-sourced content.",
    emerging: "Already emerging: fact-checking organizations flagging AI-generated viral content, journalists noting when quotes came from AI-assisted research, some newsrooms requiring sourcing chains for AI-assisted stories.",
    barrier: "What's resisting it: social media's share mechanics are frictionless by design. Adding a mental step ('was this AI-generated?') runs against platform incentives and the psychology of sharing. The norm needs platform design support to become habitual.",
  },
  {
    id: "contextual",
    cat: "Contextual Appropriateness",
    catColor: "#C4A0F0",
    name: "Preserve Human Presence Where It Matters",
    oneliner: "Some contexts require a human — by virtue of what the context means.",
    full: "There are contexts where AI participation is technically possible but contextually wrong — not because the output would be lower quality, but because the context is constituted by human presence and effort. A eulogy written by AI, a job reference generated by AI, a therapy session conducted by AI — these violate something about what the context means to its participants, independent of output quality.",
    analog: "Analogous to: the norm against using a ghostwriter for a personal diary, the norm against hiring someone else to take your wedding vows, the norm against recording a private conversation. These aren't about quality — they're about what kind of act this is.",
    emerging: "Already emerging weakly: some schools specifying 'in-class, handwritten' assignments to preserve assessment integrity. Some therapists explicitly prohibiting AI substitution in their practices. The norm exists but lacks vocabulary.",
    barrier: "What's resisting it: the line between 'AI assistance' and 'AI substitution' is genuinely blurry, and people have strong incentives to locate themselves on the assistance side. The norm needs clearer categories than 'don't use AI' vs. 'AI is fine here.'",
  },
  {
    id: "consent",
    cat: "Consent & Likeness",
    catColor: "#E07868",
    name: "Don't Put People In Machines Without Asking",
    oneliner: "Don't train on, synthesize, or simulate another person without their meaningful consent.",
    full: "Using a person's voice, likeness, writing style, or personal data as input to AI systems — without consent — violates something fundamental about their self-determination. This includes training models on scraped social media, generating synthetic voice from recordings, and creating 'AI clones' of living people for commercial purposes.",
    analog: "Analogous to: the norm against using someone's photo without permission, the right of publicity in law, recording consent norms. We have weak but real norms against appropriating a person's identity commercially — they need to extend explicitly to AI.",
    emerging: "Already emerging: music industry push-back on AI voice cloning (Drake/The Weeknd case, 2023), Tennessee's ELVIS Act (2024) protecting voice likeness, Screen Actors Guild strike demands including AI provisions. The legal norm is ahead of the social norm here.",
    barrier: "What's resisting it: the technical ease of appropriation far outpaces awareness that it's happening. Most people whose voices or writing were scraped for training don't know it occurred. You can't consent to what you don't know is happening.",
  },
  {
    id: "epistemic",
    cat: "Epistemic Hygiene",
    catColor: "#E8C37A",
    name: "Keep Humans in the Loop for Consequential Decisions",
    oneliner: "Don't let a model make the final call when the stakes are real for another person.",
    full: "For decisions with significant consequences for another human — hiring, lending, medical diagnosis, legal judgment, criminal risk scoring — a human being should make the actual decision, informed by but not replaced by AI output. This is a civic norm, not just a legal one: the accountability relationship requires a human who can be questioned, challenged, and held responsible.",
    analog: "Analogous to: the norm that a doctor should explain a diagnosis in person, the norm that judges should write reasoned opinions, the norm against fully automated contract signing. These exist because the relationship of accountability requires a human face.",
    emerging: "Already emerging in law (EU AI Act's human oversight requirements for high-risk systems), in medicine (AI-assisted but not AI-decided), in some HR contexts. Weaker as a social norm than as a legal one — people are often willing to be governed by algorithm if it saves time.",
    barrier: "What's resisting it: automation is cheaper. Human review is a cost. The norm requires that we value accountability relationships enough to pay for them — which is a values claim that has to be made explicitly and publicly.",
  },
  {
    id: "powerasymmetry",
    cat: "Power & Scale",
    catColor: "#7EC8A8",
    name: "Don't Use Scale to Overwhelm Individuals",
    oneliner: "Using AI to flood, saturate, or systemically outgun a single person or small group is a categorical wrong.",
    full: "AI enables asymmetric attacks at scale: generating thousands of harassing messages, flooding a journalist's inbox, overwhelming a small organization with synthetic reviews, saturating a legal opponent with discovery documents. Even where technically legal, these uses weaponize the scale advantage of AI against the limits of human bandwidth. The norm: don't use automation to exploit the human limitation of the person on the other end.",
    analog: "Analogous to: the norm against using a megaphone to intimidate a single person, antitrust norms against predatory pricing, the 'don't punch down' norm in comedy. The asymmetry of power creates an ethical obligation, separate from legality.",
    emerging: "Already emerging: platform policies against coordinated inauthentic behavior, court sanctions for AI-generated discovery abuse, some journalism ethics codes prohibiting bot-assisted harassment coverage. Strongest where the victim is visible and the asymmetry is extreme.",
    barrier: "What's resisting it: scale attacks are often deniable ('I just used publicly available tools'), the victim is often not a sympathetic figure (a political opponent, a corporation), and the norm is genuinely contested in adversarial contexts like litigation and political campaigning.",
  },
];

const STICK_CONDITIONS = [
  { label: "Visibility of Violation", color: "#E8C37A", title: "Can you see when the norm is broken?", body: "Drunk driving norms work partly because accidents are visible and breathalyzers provide evidence. Spam norms work because recipients can identify unsolicited bulk mail. AI disclosure norms face a fundamental visibility problem: you often cannot tell if content was AI-generated, which makes the violation invisible and unenforceable by social sanction.", ai: "For AI: watermarking, detection tools, and disclosure requirements are attempts to solve the visibility problem. Without them, most civic norms around AI content cannot function — the violation is simply invisible." },
  { label: "Sanctioning Community", color: "#7EC8A8", title: "Is there a community with authority to enforce?", body: "Academic plagiarism norms work because universities have clear authority and a defined community of practitioners. Early spam norms worked because the technical internet community had shared infrastructure and reputational systems. AI norm enforcement requires communities with authority — professional bodies, platforms, institutions — that currently lack either the will or the tools.", ai: "For AI: the most plausible sanctioning communities are professions (law, medicine, journalism), platforms (app stores, social networks), and institutions (universities, employers). None has yet claimed this role comprehensively." },
  { label: "Low Enforcement Cost", color: "#C4A0F0", title: "Is it cheap to sanction violators?", body: "Seatbelt norms became effective once enforcement was cheap (visible, cops could pull you over). Smoking norms in restaurants worked once the violation was obvious and exit (asking someone to leave) was low-cost. AI norm enforcement is expensive: it requires detection tools, expert judgment, and institutional will. The cost barrier is high.", ai: "For AI: this is the strongest argument for platform-level enforcement over individual social sanction. Platforms can make enforcement cheap (algorithmic detection, automated labeling) in ways that individuals cannot." },
  { label: "Legibility of Harm", color: "#E07868", title: "Is the harm clear enough to anchor the norm?", body: "MADD succeeded because drunk driving deaths were quantifiable, attributable, and emotionally legible. Asbestos norms hardened after mesothelioma became clearly linked. AI harms are often probabilistic, distributed, and delayed — a hiring algorithm doesn't produce a visible victim in the way a car crash does. The harm exists; its legibility is the problem.", ai: "For AI: the 'MacPherson moment' — a single legible, attributable, sympathetic harm — may be what crystallizes civic norms as much as law. We are waiting for that case as much for civic norms as for legal doctrine." },
];

// ─── CIVIC TAB ───────────────────────────────────────────────────────────────

function CivicTab() {
  const [openNorm, setOpenNorm] = useState(null);

  return (
    <div>
      {/* Banner */}
      <div className="civic-banner">
        <div className="civic-eyebrow">V. The Civic Layer</div>
        <div className="civic-headline">
          The largest uncontrolled<br/><em>experiment in history</em>
        </div>
        <div className="civic-lead">
          Every prior transformative technology was gated. Cars required licenses. Nuclear required states. The printing press required capital and literacy. Generative AI required an internet connection — and was handed, simultaneously, to five billion people with no onboarding, no civic education, no behavioral norms, and no consent mechanism. We are inventing the rules of the road while driving at speed. The question is whether citizens have a role in writing them — or whether they will only ever be governed.
        </div>
      </div>

      {/* Scale stats */}
      <div className="civic-stat-grid">
        <div className="civic-stat">
          <div className="civic-stat-num">60</div>
          <div className="civic-stat-label">Days for ChatGPT to reach 100 million users</div>
          <div className="civic-stat-note">Fastest technology adoption in history</div>
        </div>
        <div className="civic-stat">
          <div className="civic-stat-num">5B+</div>
          <div className="civic-stat-label">People with internet access when AI was deployed</div>
          <div className="civic-stat-note">Simultaneous test subjects, no consent obtained</div>
        </div>
        <div className="civic-stat">
          <div className="civic-stat-num">0</div>
          <div className="civic-stat-label">Civic education programs deployed alongside AI tools</div>
          <div className="civic-stat-note">vs. decades of driver education before cars became universal</div>
        </div>
        <div className="civic-stat">
          <div className="civic-stat-num">~30</div>
          <div className="civic-stat-label">Years it took for social media norms to begin consolidating</div>
          <div className="civic-stat-note">We may not have that long for AI</div>
        </div>
      </div>

      {/* Lineage */}
      <div className="civic-section-head">
        <div className="civic-section-title">How norms have followed powerful tools</div>
        <div className="civic-section-desc">Every mass-deployment technology eventually generated civic norms — rules of behavior that preceded law, ran alongside it, or filled gaps it couldn't reach. The pattern: visible harm, organized response, moral reframing, norm crystallization. The timeline varies wildly.</div>
      </div>
      <div className="lineage-row">
        {LINEAGE.map((item, i) => (
          <div key={i} className="lineage-item">
            <div className="lineage-year">
              <div className="lineage-year-text">{item.year}</div>
            </div>
            <div className="lineage-body">
              <div className="lineage-title">{item.title}</div>
              <div className="lineage-desc">{item.desc}</div>
              <div className="lineage-lesson">{item.lesson}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Norm categories */}
      <div className="civic-section-head">
        <div className="civic-section-title">Six emerging civic norms for AI</div>
        <div className="civic-section-desc">These are not laws. They are not yet fully formed. But they are the norms that serious people are beginning to articulate, and that some communities are beginning to enforce. Click each to see the analog, where it's emerging, and what's resisting it.</div>
      </div>
      <div className="norm-grid">
        {NORMS.map(norm => {
          const isOpen = openNorm === norm.id;
          return (
            <div key={norm.id} className={`norm-card ${isOpen ? "open" : ""}`} onClick={() => setOpenNorm(isOpen ? null : norm.id)}>
              <div className="norm-card-header">
                <div className="norm-cat" style={{ color: norm.catColor }}>{norm.cat}</div>
                <div className="norm-name">{norm.name}</div>
                <div className="norm-oneliner">{norm.oneliner}</div>
                {!isOpen && <div className="norm-hint">↓ click for analog, emergence & barriers</div>}
              </div>
              {isOpen && (
                <div className="norm-expand">
                  <div className="norm-expand-inner">
                    <div>
                      <div className="norm-field-label">The norm</div>
                      <div className="norm-field">{norm.full}</div>
                    </div>
                    <div>
                      <div className="norm-field-label">Historical analog</div>
                      <div className="norm-analog">{norm.analog}</div>
                    </div>
                    <div>
                      <div className="norm-field-label">Where it's emerging</div>
                      <div className="norm-emerging">{norm.emerging}</div>
                    </div>
                    <div>
                      <div className="norm-field-label">What's resisting it</div>
                      <div className="norm-barrier">{norm.barrier}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What makes norms stick */}
      <div className="civic-section-head">
        <div className="civic-section-title">What makes norms stick — and where AI struggles</div>
        <div className="civic-section-desc">Social norms require specific conditions to take hold and persist. AI satisfies some of these. For the ones it doesn't, we need deliberate infrastructure — design choices, platform policies, institutional mandates — to compensate.</div>
      </div>
      <div className="stick-grid">
        {STICK_CONDITIONS.map((cond, i) => (
          <div key={i} className="stick-card">
            <div className="stick-label" style={{ color: cond.color }}>{cond.label}</div>
            <div className="stick-title">{cond.title}</div>
            <div className="stick-body">{cond.body}</div>
            <div className="stick-ai">{cond.ai}</div>
          </div>
        ))}
      </div>

      {/* Honest tension */}
      <div className="honest-tension" style={{ marginBottom: "32px" }}>
        <div className="honest-tension-title">The honest tension: is this pollyannish?</div>
        <div className="honest-tension-body">
          The strongest objection to civic norm-building is that bad actors — by definition — ignore norms. The people most likely to generate synthetic disinformation, clone voices without consent, or flood individuals with AI harassment are exactly the people least embedded in the communities that enforce norms. Norms, on this view, only bind the already-compliant.<br/><br/>
          The answer is not that this objection is wrong — it's that <span style={{ color: "#E8C37A" }}>civic norms serve a different function than prohibition</span>. They define the baseline of acceptable participation in a shared information environment. They make violations visible and nameable. They create the social infrastructure that makes law enforceable when it arrives. Drunk driving norms didn't stop every drunk driver — they changed what the community expected, reported, and sanctioned, which made enforcement possible. <span style={{ color: "#7EC8A8" }}>The goal of civic norms is not to eliminate bad actors. It is to reduce the social permission structure that bad actors rely on.</span>
          <br/><br/>
          Ready to form your own view? Head to <strong style={{color:"#E8C37A"}}>Build Your POV</strong> — the final question now asks directly where citizens fit in your governance framework.
        </div>
      </div>
    </div>
  );
}
