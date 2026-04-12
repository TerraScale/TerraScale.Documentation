import type { ParamMatcher } from '@sveltejs/kit';
import { isValidLocale } from '$lib/i18n/locales';

export const match: ParamMatcher = (param): param is 'en' | 'pt-br' | 'es' => isValidLocale(param);
