<script lang="ts">
	import { onMount } from 'svelte';

	type ParameterObject = {
		name: string;
		in: string;
		required?: boolean;
		description?: string;
		schema?: SchemaObject;
		$ref?: string;
	};

	type MediaTypeObject = {
		schema?: SchemaObject;
	};

	type RequestBodyObject = {
		required?: boolean;
		content?: Record<string, MediaTypeObject>;
		$ref?: string;
	};

	type ResponseObject = {
		description?: string;
		content?: Record<string, MediaTypeObject>;
		$ref?: string;
	};

	type PathOperation = {
		summary?: string;
		description?: string;
		tags?: string[];
		security?: Array<Record<string, string[]>>;
		parameters?: ParameterObject[];
		requestBody?: RequestBodyObject;
		responses?: Record<string, ResponseObject>;
	};

	type PathItem = {
		parameters?: ParameterObject[];
	} & Partial<Record<(typeof HTTP_METHODS)[number], PathOperation>>;

	type SchemaObject = {
		type?: string;
		enum?: string[];
		format?: string;
		nullable?: boolean;
		properties?: Record<string, SchemaObject>;
		items?: SchemaObject;
		additionalProperties?: boolean | SchemaObject;
		$ref?: string;
		description?: string;
		required?: string[];
	};

	type Operation = {
		id: string;
		path: string;
		method: string;
		summary: string;
		description?: string;
		tags: string[];
		security?: Array<Record<string, string[]>>;
		parameters: Array<{
			name: string;
			in: string;
			required?: boolean;
			description?: string;
			schema?: SchemaObject;
		}>;
		requestBody?: {
			required?: boolean;
			schema?: SchemaObject;
		};
		responses: Array<{
			status: string;
			description?: string;
			schema?: SchemaObject;
		}>;
	};

	type SpecDocument = {
		info?: { title?: string; description?: string; version?: string };
		servers?: Array<{ url: string; description?: string }>;
		tags?: Array<{ name: string; description?: string }>;
		paths?: Record<string, PathItem>;
		components?: {
			schemas?: Record<string, SchemaObject>;
			parameters?: Record<string, ParameterObject>;
			requestBodies?: Record<string, RequestBodyObject>;
			responses?: Record<string, ResponseObject>;
		};
	};

	const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

	let spec = $state<SpecDocument | null>(null);
	let operations = $state<Operation[]>([]);
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let expanded = $state<Record<string, boolean>>({});
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let loading = $state(true);
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let error = $state<string | null>(null);

	function methodTone(method: string) {
		switch (method.toUpperCase()) {
			case 'GET':
				return 'get';
			case 'POST':
				return 'post';
			case 'PUT':
				return 'put';
			case 'PATCH':
				return 'patch';
			case 'DELETE':
				return 'delete';
			default:
				return 'neutral';
		}
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function methodBadgeClass(method: string) {
		switch (methodTone(method)) {
			case 'get':
				return 'bg-emerald-500/18 text-emerald-400';
			case 'post':
				return 'bg-blue-500/18 text-blue-400';
			case 'put':
				return 'bg-amber-500/18 text-amber-400';
			case 'patch':
				return 'bg-purple-500/18 text-purple-300';
			case 'delete':
				return 'bg-red-500/18 text-red-400';
			default:
				return 'bg-slate-400/18 text-slate-300';
		}
	}

	function resolveRef<T extends { $ref?: string }>(value: T, document: SpecDocument): T {
		if (!value || typeof value !== 'object' || !value.$ref) {
			return value;
		}

		const ref = value.$ref;
		const [, , section, name] = ref.split('/');
		if (!section || !name) {
			return value;
		}

		const source = (document.components as Record<string, Record<string, unknown>> | undefined)?.[section]?.[name];
		return (source as T | undefined) ?? value;
	}

	function summarizeSchema(schema?: SchemaObject, document?: SpecDocument): string {
		if (!schema) {
			return '—';
		}

		const resolved = document ? resolveRef(schema, document) : schema;
		if (resolved.$ref) {
			return resolved.$ref.split('/').at(-1) ?? 'object';
		}
		if (resolved.enum?.length) {
			return resolved.enum.join(' | ');
		}
		if (resolved.type === 'array') {
			return `array<${summarizeSchema(resolved.items, document)}>`;
		}
		if (resolved.type === 'object' && resolved.properties) {
			return `object (${Object.keys(resolved.properties).length} fields)`;
		}
		if (resolved.type) {
			return resolved.format ? `${resolved.type} · ${resolved.format}` : resolved.type;
		}
		if (resolved.additionalProperties) {
			return 'object';
		}
		return 'object';
	}

	function getRequestSchema(operation: PathOperation, document: SpecDocument) {
		const body = operation.requestBody ? resolveRef(operation.requestBody, document) : undefined;
		const schema = body?.content?.['application/json']?.schema;
		return schema ? resolveRef(schema, document) : undefined;
	}

	function getResponseSchema(response: ResponseObject, document: SpecDocument) {
		const resolved = resolveRef(response, document);
		const schema = resolved?.content?.['application/json']?.schema;
		return schema ? resolveRef(schema, document) : undefined;
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function getSchemaFields(schema: SchemaObject | undefined, document: SpecDocument) {
		if (!schema) {
			return [];
		}

		const resolved = resolveRef(schema, document);
		const properties = resolved.properties ?? {};
		const required = new Set(resolved.required ?? []);

		return Object.entries(properties).map(([name, definition]) => {
			const field = resolveRef(definition, document);
			return {
				name,
				required: required.has(name),
				description: field.description,
				type: summarizeSchema(field, document)
			};
		});
	}

	function normalizeOperations(document: SpecDocument): Operation[] {
		const items = Object.entries(document.paths ?? {}).flatMap(([path, pathItem]) =>
			HTTP_METHODS.flatMap((method) => {
				const operation = pathItem?.[method];
				if (!operation) {
					return [];
				}

				const mergedParameters = [
					...(pathItem?.parameters ?? []),
					...(operation.parameters ?? [])
				].map((parameter) => resolveRef(parameter, document));

				return [
					{
						id: `${method}:${path}`,
						path,
						method: method.toUpperCase(),
						summary: operation.summary ?? `${method.toUpperCase()} ${path}`,
						description: operation.description,
						tags: operation.tags ?? ['General'],
						security: operation.security,
						parameters: mergedParameters.map((parameter) => ({
							name: parameter.name,
							in: parameter.in,
							required: parameter.required,
							description: parameter.description,
							schema: parameter.schema ? resolveRef(parameter.schema, document) : undefined
						})),
						requestBody: operation.requestBody
							? {
								required: resolveRef(operation.requestBody, document)?.required,
								schema: getRequestSchema(operation, document)
							}
							: undefined,
						responses: Object.entries(operation.responses ?? {}).map(([status, response]) => ({
							status,
							description: resolveRef(response, document)?.description,
							schema: getResponseSchema(response, document)
						}))
					}
				];
			})
		);

		return items.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const groupedOperations = $derived.by(() => {
		const groups = new Map<string, Operation[]>();
		for (const operation of operations) {
			const group = operation.tags[0] ?? 'General';
			const list = groups.get(group);
			if (list) {
				list.push(operation);
			} else {
				groups.set(group, [operation]);
			}
		}
		return Array.from(groups.entries()).map(([tag, items]) => ({
			tag,
			description: spec?.tags?.find((entry) => entry.name === tag)?.description,
			items
		}));
	});

	onMount(async () => {
		try {
			const [response, yaml] = await Promise.all([fetch('/openapi/terrascale.yaml'), import('yaml')]);
			if (!response.ok) {
				throw new Error(`Failed to load spec (${response.status})`);
			}

			const source = await response.text();
			const document = yaml.parse(source) as SpecDocument;
			spec = document;
			operations = normalizeOperations(document);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Failed to load OpenAPI specification.';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<p class="rounded-[0.875rem] border border-white/10 bg-white/6 px-5 py-4 text-[0.94rem] leading-[1.7] tracking-[0.01em] text-slate-300">Loading explorer…</p>
{:else if error}
	<p class="rounded-[0.875rem] border border-white/10 bg-white/6 px-5 py-4 text-[0.94rem] leading-[1.7] tracking-[0.01em] text-red-400">{error}</p>
{:else if spec}
	<div class="grid gap-6">
		<section class="grid gap-4 rounded-2xl border border-white/10 bg-white/6 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px]">
			<div>
				<p class="mb-[0.85rem] text-[0.72rem] font-medium uppercase tracking-[0.12em] text-blue-300">OpenAPI source</p>
				<h2 class="m-0 text-[1.7rem] leading-[1.18] tracking-[0.01em] text-slate-50">{spec.info?.title}</h2>
				<p class="mt-3 max-w-3xl text-[0.98rem] leading-[1.8] tracking-[0.01em] text-slate-400">{spec.info?.description}</p>
			</div>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
				<div>
					<span class="block text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400">Version</span>
					<strong class="mt-1 block text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{spec.info?.version ?? '—'}</strong>
				</div>
				<div>
					<span class="block text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400">Server</span>
					<strong class="mt-1 block text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{spec.servers?.[0]?.url ?? '—'}</strong>
				</div>
				<div>
					<span class="block text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400">Operations</span>
					<strong class="mt-1 block text-[0.98rem] font-semibold tracking-[0.01em] text-slate-50">{operations.length}</strong>
				</div>
			</div>
		</section>

		{#each groupedOperations as group}
			<section class="grid gap-3.5">
				<header>
					<h3 class="m-0 text-[1.2rem] leading-[1.3] tracking-[0.01em] text-slate-50">{group.tag}</h3>
					{#if group.description}<p class="mt-[0.45rem] text-[0.94rem] leading-[1.75] tracking-[0.01em] text-[var(--color-ts-text-muted)]">{group.description}</p>{/if}
				</header>
				<div class="grid gap-3.5">
					{#each group.items as operation}
						<article class="rounded-[0.875rem] border border-white/10 bg-[color-mix(in_oklab,var(--color-ts-surface)_88%,transparent)]">
							<button class="flex w-full items-center justify-between gap-4 px-[1.125rem] py-4 text-left text-inherit" type="button" onclick={() => (expanded[operation.id] = !expanded[operation.id])}>
								<div class="flex items-start gap-3.5 max-[768px]:flex-col">
									<span class={`inline-flex min-w-[4.5rem] justify-center rounded-full px-[0.6rem] py-[0.35rem] text-[0.72rem] font-semibold uppercase tracking-[0.08em] ${methodBadgeClass(operation.method)}`}>{operation.method}</span>
									<div>
										<h4 class="m-0 text-[1rem] font-semibold leading-[1.35] tracking-[0.01em] text-slate-50">{operation.summary}</h4>
										<code class="mt-1 block text-[0.84rem] text-slate-400">{operation.path}</code>
									</div>
								</div>
								<span class="text-2xl leading-none text-slate-400">{expanded[operation.id] ? '−' : '+'}</span>
							</button>

							{#if expanded[operation.id]}
								<div class="grid gap-4 px-[1.125rem] pb-[1.125rem]">
									{#if operation.description}<p class="text-[0.95rem] leading-[1.75] tracking-[0.01em] text-slate-300">{operation.description}</p>{/if}
									<p class="text-[0.9rem] leading-[1.7] tracking-[0.01em] text-slate-400">
										<strong>Auth:</strong>
										{operation.security?.length === 0 ? 'None' : 'Bearer token'}
									</p>

									{#if operation.parameters.length > 0}
										<div class="grid gap-[0.6rem]">
											<h5 class="m-0 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-slate-100">Parameters</h5>
											<table class="w-full border-collapse text-[0.9rem]">
												<thead>
													<tr><th class="border-b border-white/8 px-3 py-[0.65rem] text-left align-top font-semibold text-[var(--color-ts-text-muted)]">Name</th><th class="border-b border-white/8 px-3 py-[0.65rem] text-left align-top font-semibold text-[var(--color-ts-text-muted)]">In</th><th class="border-b border-white/8 px-3 py-[0.65rem] text-left align-top font-semibold text-[var(--color-ts-text-muted)]">Type</th><th class="border-b border-white/8 px-3 py-[0.65rem] text-left align-top font-semibold text-[var(--color-ts-text-muted)]">Required</th></tr>
												</thead>
												<tbody>
													{#each operation.parameters as parameter}
														<tr>
															<td class="border-b border-white/8 px-3 py-[0.65rem] align-top">
																<code class="text-[0.82rem]">{parameter.name}</code>
													{#if parameter.description}<div class="mt-1 text-[0.82rem] leading-[1.65] tracking-[0.01em] text-slate-400">{parameter.description}</div>{/if}
															</td>
															<td class="border-b border-white/8 px-3 py-[0.65rem] align-top">{parameter.in}</td>
															<td class="border-b border-white/8 px-3 py-[0.65rem] align-top">{summarizeSchema(parameter.schema, spec)}</td>
															<td class="border-b border-white/8 px-3 py-[0.65rem] align-top">{parameter.required ? 'Yes' : 'No'}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									{/if}

									{#if operation.requestBody}
										<div class="grid gap-[0.6rem]">
											<h5 class="m-0 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-slate-100">Request body</h5>
											<p class="text-[0.9rem] leading-[1.7] tracking-[0.01em] text-slate-400">{operation.requestBody.required ? 'Required' : 'Optional'} · {summarizeSchema(operation.requestBody.schema, spec)}</p>
											{#if getSchemaFields(operation.requestBody.schema, spec).length > 0}
												<ul class="m-0 pl-[1.1rem] [&>li]:mb-2 [&>li]:grid [&>li]:gap-1">
													{#each getSchemaFields(operation.requestBody.schema, spec) as field}
														<li><code>{field.name}</code> — {field.type}{field.required ? ' · required' : ''}</li>
													{/each}
												</ul>
											{/if}
										</div>
									{/if}

									<div class="grid gap-[0.6rem]">
											<h5 class="m-0 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-slate-100">Responses</h5>
										<ul class="m-0 pl-[1.1rem] [&>li]:mb-2 [&>li]:grid [&>li]:gap-1">
											{#each operation.responses as response}
												<li>
													<strong>{response.status}</strong>
													<span>{response.description ?? 'Response'}</span>
													<code>{summarizeSchema(response.schema, spec)}</code>
												</li>
											{/each}
										</ul>
									</div>
								</div>
							{/if}
						</article>
					{/each}
				</div>
					</section>
		{/each}
	</div>
{/if}
