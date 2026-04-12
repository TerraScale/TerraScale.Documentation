export type RoadmapTone = 'live' | 'next' | 'exploring' | 'goal';

export interface RoadmapLegendItem {
	label: string;
	description: string;
	tone: RoadmapTone;
}

export interface RoadmapStage {
	label: string;
	detail: string;
	state: 'completed' | 'current' | 'upcoming';
}

export interface RoadmapItem {
	title: string;
	icon: string;
	summary: string;
	customerValue: string;
	technicalNote: string;
	scopeNote?: string;
}

export const roadmapLegend: RoadmapLegendItem[] = [
	{
		label: 'Live now',
		description: 'Available in Public Alpha today and ready to use.',
		tone: 'live'
	},
	{
		label: 'Next up',
		description: 'Actively prioritized for near-term delivery, without hard date promises.',
		tone: 'next'
	},
	{
		label: 'Exploring',
		description: 'Important directions we are validating before they become commitments.',
		tone: 'exploring'
	},
	{
		label: 'Stable release goals',
		description: 'Release criteria that define trust, safety, and product polish.',
		tone: 'goal'
	}
];

export const roadmapStages: RoadmapStage[] = [
	{
		label: 'Public Alpha',
		detail: 'Core capabilities are live, and the product is still tightening guardrails.',
		state: 'current'
	},
	{
		label: 'Beta',
		detail: 'Performance automation and operational visibility mature into repeatable workflows.',
		state: 'upcoming'
	},
	{
		label: 'Stable Release',
		detail: 'Trust, recovery, and day-to-day operator experience are strong enough for wider production use.',
		state: 'upcoming'
	}
];

export const liveNowItems: RoadmapItem[] = [
	{
		title: 'Multi-region replication',
		icon: 'globe',
		summary: 'TerraScale already lets teams keep databases available across multiple regions in Public Alpha.',
		customerValue: 'Global applications can place reads closer to users and reduce the blast radius of a single-region issue.',
		technicalNote:
			'Writes land durably in the primary region first, then replicate asynchronously to the selected replicas.',
		scopeNote:
			'Cross-region reads are designed around eventual consistency unless the workload intentionally goes back to the primary path.'
	},
	{
		title: 'Core APIs and typed workflows',
		icon: 'code',
		summary: 'The current platform already covers REST, SQL-style access patterns, and repository-driven application workflows.',
		customerValue: 'Teams can start integrating TerraScale now instead of waiting for a future interface refresh.',
		technicalNote:
			'The docs already expose the current API surface, typed repository patterns, and authentication flows used in Public Alpha.'
	},
	{
		title: 'Global routing footprint',
		icon: 'rocket',
		summary: 'Public docs position TerraScale across 19 regions with edge-aware routing and low-latency reads.',
		customerValue: 'Developers can design for a global audience without building their own regional routing layer first.',
		technicalNote:
			'Requests are routed through a region-aware path so the platform can keep latency low while respecting replica placement.'
	},
	{
		title: 'Alpha guardrails',
		icon: 'database',
		summary: 'Public Alpha currently keeps a 100 GB limit per database while storage behavior and recovery paths are still being hardened.',
		customerValue: 'The constraint keeps the product honest about its current operating envelope instead of overpromising capacity.',
		technicalNote:
			'This limit is a product guardrail, not the long-term target, and it sets up the next storage expansion step cleanly.'
	}
];

export const nextUpItems: RoadmapItem[] = [
	{
		title: 'Auto-indexing for repeated query shapes',
		icon: 'chart-column',
		summary: 'Frequently repeated query patterns should lead to smarter indexing without manual tuning for every workload.',
		customerValue: 'Popular queries get faster as usage grows, even when teams are still learning how to model the best access pattern.',
		technicalNote:
			'The planned direction is to observe repeated query shapes, then create grouped indexes around the properties those queries keep using.',
		scopeNote:
			'This stays outcome-first on the roadmap because the policy and thresholds should be tuned from real production usage, not guessed too early.'
	},
	{
		title: 'Automatic query caching',
		icon: 'zap',
		summary: 'TerraScale should cache more safe read paths automatically and invalidate them without operator babysitting.',
		customerValue: 'Apps see faster repeated reads and fewer avoidable trips through the full query path.',
		technicalNote:
			'The goal is aggressive caching where invalidation can stay reliable, so performance improves without turning correctness into a tradeoff.'
	},
	{
		title: 'Manual memory caching controls',
		icon: 'settings',
		summary: 'Teams should also have an explicit way to pin important query results into a managed memory budget.',
		customerValue: 'High-value reads can stay hot even when an application wants more direct control than automatic caching alone provides.',
		technicalNote:
			'The current plan is an LRU-style eviction model so new entries can replace the oldest cached results once the plan memory allowance is full.'
	},
	{
		title: 'Higher storage ceiling',
		icon: 'database',
		summary: 'The current 100 GB database guardrail is planned to move to 500 GB during Public Alpha.',
		customerValue: 'Teams get more room to keep growing on the platform before they need a bespoke capacity conversation.',
		technicalNote:
			'The capacity lift should happen alongside continued work on storage operations, recovery paths, and predictable performance at larger sizes.'
	}
];

export const exploringItems: RoadmapItem[] = [
	{
		title: 'Workload insight surfaces',
		icon: 'file-text',
		summary: 'As indexing and caching automation expand, operators should also see why a workload is fast, slow, cached, or still scanning.',
		customerValue: 'Better visibility makes performance features easier to trust and easier to debug.',
		technicalNote:
			'This points toward explainability around query behavior, cache decisions, and the places where manual action still helps.'
	},
	{
		title: 'Safer automation controls',
		icon: 'shield',
		summary: 'Automation should become more observable and overridable before it becomes more aggressive.',
		customerValue: 'Teams keep confidence that smart defaults are helping, not hiding behavior they cannot reason about.',
		technicalNote:
			'That includes room for policy controls, guardrails, and clearer boundaries between automatic acceleration and manual operator intent.'
	}
];

export const stableReleaseGoalItems: RoadmapItem[] = [
	{
		title: 'Replication resilience',
		icon: 'globe',
		summary: 'Stable release means replication can recover cleanly from network interruptions and regional problems without operator panic.',
		customerValue: 'Teams can trust cross-region data flow to self-heal instead of becoming a hidden source of correctness risk.',
		technicalNote:
			'The public goal is robust reconciliation after interrupted replication so replicas converge again once the network path is healthy.'
	},
	{
		title: 'Safer upgrades and failover behavior',
		icon: 'shield',
		summary: 'Maintenance, regional incidents, and controlled failovers should feel boring by the time TerraScale calls itself stable.',
		customerValue: 'Customers gain confidence that availability does not vanish during planned work or unexpected disruption.',
		technicalNote:
			'The release bar is progressive operational behavior that keeps healthy regions serving traffic while work happens elsewhere.'
	},
	{
		title: 'Data correctness and tenant trust',
		icon: 'badge-check',
		summary: 'Stable release is not just feature complete. It is a promise that data safety and isolation are dependable.',
		customerValue: 'Teams can adopt the platform for serious workloads without second-guessing basic safety guarantees.',
		technicalNote:
			'That bar includes confidence around persistence, isolation boundaries, and recovery procedures, not only headline performance.'
	},
	{
		title: 'Product polish for daily use',
		icon: 'pencil-line',
		summary: 'Dashboard flows, docs clarity, error messages, and DX rough edges still need to feel coherent before stable release.',
		customerValue: 'A platform becomes easier to adopt when day-to-day operations are understandable, not only powerful.',
		technicalNote:
			'This is where UX and DX polish joins the engineering bar so the stable release feels ready in practice, not only in architecture.'
	}
];
