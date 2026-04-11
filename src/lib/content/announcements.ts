export type AnnouncementVariant = 'info' | 'warning' | 'success';

export interface Announcement {
	text: string;
	link?: string;
	variant?: AnnouncementVariant;
}

export const activeAnnouncement: Announcement | null = {
	text: 'TerraScale v2.0 is here — see what\'s new',
	link: '/roadmap/release/',
	variant: 'info'
};
