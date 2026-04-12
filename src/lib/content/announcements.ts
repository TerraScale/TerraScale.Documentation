export type AnnouncementVariant = 'info' | 'warning' | 'success';

export interface Announcement {
	text: string;
	link?: string;
	variant?: AnnouncementVariant;
}

export const activeAnnouncement: Announcement | null = {
	text: 'TerraScale Public Alpha is here',
	link: '/roadmap/release/',
	variant: 'warning'
};
