// Thin typed client for the Flash Props API (https://api.flashodds.live).
// Uses the built-in global fetch (Node 20+), so there are no HTTP deps.
import { config, SIGNUP_URL } from './config';

export interface ScanRow {
	player: string;
	stat: string;
	line: number;
	overOdds?: number;
	underOdds?: number;
	sport: string;
	homeTeam: string;
	awayTeam: string;
	source: string;
}

export interface Mover {
	sport: string;
	player: string;
	stat: string;
	openedLine: number | null;
	currentLine: number | null;
	movement: number | null;
	lastChangedAt: number | null;
	points: number;
}

export interface ScanResponse {
	sport: string;
	stat: string | null;
	count: number;
	rows: ScanRow[];
}
export interface MovementResponse {
	since: string;
	count: number;
	movers: Mover[];
}

// A typed error carrying the API's HTTP status + error code, so command
// handlers can react (e.g. 403 -> "that's a Pro feature").
export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public code?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function api<T>(path: string): Promise<T> {
	if (!config.apiKey) {
		throw new ApiError(0, `No API key configured. Get a free key at ${SIGNUP_URL} and set FLASH_PROPS_API_KEY.`, 'no_key');
	}
	let res: Response;
	try {
		res = await fetch(`${config.baseUrl}${path}`, {
			headers: { Authorization: `Bearer ${config.apiKey}`, Accept: 'application/json' }
		});
	} catch {
		throw new ApiError(0, 'Could not reach the Flash Props API. Check your connection and FLASH_PROPS_BASE_URL.', 'network');
	}
	const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	if (!res.ok) {
		throw new ApiError(res.status, (body.message as string) || `Request failed (HTTP ${res.status})`, body.error as string);
	}
	return body as T;
}

export function scanBoard(opts: { sport?: string; stat?: string; limit?: number }): Promise<ScanResponse> {
	const p = new URLSearchParams();
	if (opts.sport) p.set('sport', opts.sport);
	if (opts.stat) p.set('stat', opts.stat);
	p.set('limit', String(opts.limit ?? 20));
	return api<ScanResponse>(`/api/v1/props?${p.toString()}`);
}

export function movers(opts: { sport?: string; since?: string; limit?: number }): Promise<MovementResponse> {
	const p = new URLSearchParams();
	if (opts.sport) p.set('sport', opts.sport);
	p.set('since', opts.since ?? '24h');
	p.set('limit', String(opts.limit ?? 12));
	return api<MovementResponse>(`/api/v1/props/movement?${p.toString()}`);
}

export function listSports(): Promise<{ sports: { id: string; name: string; enabled: boolean }[] }> {
	return api('/api/v1/sports');
}
