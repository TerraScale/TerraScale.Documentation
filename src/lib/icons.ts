import { icons } from './icons.generated';

export type IconName = keyof typeof icons;

export function getIconMarkup(name: string) {
	return icons[name as IconName] ?? icons['arrow-right'];
}
