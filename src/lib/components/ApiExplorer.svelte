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

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
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
	<p class="explorer-state">Loading explorer…</p>
{:else if error}
	<p class="explorer-state explorer-state-error">{error}</p>
{:else if spec}
	<div class="explorer-shell">
		<section class="explorer-intro ts-glass">
			<div>
				<p class="eyebrow">OpenAPI source</p>
				<h2>{spec.info?.title}</h2>
				<p>{spec.info?.description}</p>
			</div>
			<div class="explorer-meta">
				<div>
					<span>Version</span>
					<strong>{spec.info?.version ?? '—'}</strong>
				</div>
				<div>
					<span>Server</span>
					<strong>{spec.servers?.[0]?.url ?? '—'}</strong>
				</div>
				<div>
					<span>Operations</span>
					<strong>{operations.length}</strong>
				</div>
			</div>
		</section>

		{#each groupedOperations as group}
			<section class="explorer-group">
				<header>
					<h3>{group.tag}</h3>
					{#if group.description}<p>{group.description}</p>{/if}
				</header>
				<div class="explorer-operations">
					{#each group.items as operation}
						<article class="operation-card ts-glass">
							<button class="operation-summary" type="button" onclick={() => (expanded[operation.id] = !expanded[operation.id])}>
								<div class="operation-heading">
									<span class={`method-badge ${methodTone(operation.method)}`}>{operation.method}</span>
									<div>
										<h4>{operation.summary}</h4>
										<code>{operation.path}</code>
									</div>
								</div>
								<span class="expand-indicator">{expanded[operation.id] ? '−' : '+'}</span>
							</button>

							{#if expanded[operation.id]}
								<div class="operation-details">
									{#if operation.description}<p>{operation.description}</p>{/if}
									<p class="security-line">
										<strong>Auth:</strong>
										{operation.security?.length === 0 ? 'None' : 'Bearer token'}
									</p>

									{#if operation.parameters.length > 0}
										<div class="detail-block">
											<h5>Parameters</h5>
											<table>
												<thead>
													<tr><th>Name</th><th>In</th><th>Type</th><th>Required</th></tr>
												</thead>
												<tbody>
													{#each operation.parameters as parameter}
														<tr>
															<td>
																<code>{parameter.name}</code>
																{#if parameter.description}<div class="muted">{parameter.description}</div>{/if}
															</td>
															<td>{parameter.in}</td>
															<td>{summarizeSchema(parameter.schema, spec)}</td>
															<td>{parameter.required ? 'Yes' : 'No'}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									{/if}

									{#if operation.requestBody}
										<div class="detail-block">
											<h5>Request body</h5>
											<p class="muted">{operation.requestBody.required ? 'Required' : 'Optional'} · {summarizeSchema(operation.requestBody.schema, spec)}</p>
											{#if getSchemaFields(operation.requestBody.schema, spec).length > 0}
												<ul class="field-list">
													{#each getSchemaFields(operation.requestBody.schema, spec) as field}
														<li><code>{field.name}</code> — {field.type}{field.required ? ' · required' : ''}</li>
													{/each}
												</ul>
											{/if}
										</div>
									{/if}

									<div class="detail-block">
										<h5>Responses</h5>
										<ul class="response-list">
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

<style>
	.explorer-shell {
		display: grid;
		gap: 1.5rem;
	}

	.explorer-intro {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 1rem;
	}

	.explorer-intro h2 {
		margin: 0.25rem 0 0.5rem;
	}

	.explorer-meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 0.75rem;
	}

	.explorer-meta div,
	.operation-card {
		background: color-mix(in oklab, var(--color-surface) 88%, transparent);
		border: 1px solid var(--color-border);
		border-radius: 0.875rem;
	}

	.explorer-meta div {
		padding: 0.875rem 1rem;
	}

	.explorer-meta span,
	.muted,
	.security-line {
		color: var(--color-text-muted);
		font-size: 0.925rem;
	}

	.explorer-group {
		display: grid;
		gap: 0.875rem;
	}

	.explorer-group header h3,
	.operation-heading h4,
	.detail-block h5 {
		margin: 0;
	}

	.explorer-group header p {
		margin: 0.35rem 0 0;
		color: var(--color-text-muted);
	}

	.explorer-operations {
		display: grid;
		gap: 0.875rem;
	}

	.operation-summary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.125rem;
		background: transparent;
		border: 0;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.operation-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.875rem;
	}

	.operation-heading code,
	.response-list code,
	.field-list code,
	table code {
		font-size: 0.85rem;
	}

	.expand-indicator {
		font-size: 1.5rem;
		line-height: 1;
		color: var(--color-text-muted);
	}

	.method-badge {
		display: inline-flex;
		min-width: 4.5rem;
		justify-content: center;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
	}

	.method-badge.get { background: rgba(34, 197, 94, 0.18); color: rgb(74, 222, 128); }
	.method-badge.post { background: rgba(59, 130, 246, 0.18); color: rgb(96, 165, 250); }
	.method-badge.put { background: rgba(245, 158, 11, 0.18); color: rgb(251, 191, 36); }
	.method-badge.patch { background: rgba(168, 85, 247, 0.18); color: rgb(196, 181, 253); }
	.method-badge.delete { background: rgba(239, 68, 68, 0.18); color: rgb(248, 113, 113); }
	.method-badge.neutral { background: rgba(148, 163, 184, 0.18); color: rgb(203, 213, 225); }

	.operation-details {
		display: grid;
		gap: 1rem;
		padding: 0 1.125rem 1.125rem;
	}

	.detail-block {
		display: grid;
		gap: 0.6rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.925rem;
	}

	th,
	td {
		padding: 0.65rem 0.75rem;
		border-bottom: 1px solid var(--color-border);
		vertical-align: top;
	}

	th {
		text-align: left;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.field-list,
	.response-list {
		margin: 0;
		padding-left: 1.1rem;
	}

	.response-list li {
		display: grid;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.explorer-state {
		padding: 1rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: 0.875rem;
		background: color-mix(in oklab, var(--color-surface) 88%, transparent);
	}

	.explorer-state-error {
		color: rgb(248, 113, 113);
	}

	@media (max-width: 768px) {
		.operation-heading {
			flex-direction: column;
		}

		.operation-summary {
			align-items: flex-start;
		}
	}
</style>
