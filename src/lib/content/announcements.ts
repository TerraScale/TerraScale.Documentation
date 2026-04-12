export type AnnouncementVariant = 'info' | 'warning' | 'success';

export interface Announcement {
	text: string;
	link?: string;
	variant?: AnnouncementVariant;
}

export const activeAnnouncement: Announcement | null = {
	text: 'See the TerraScale public roadmap',
	link: '/roadmap/',
	variant: 'warning'
};
