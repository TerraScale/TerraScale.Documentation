export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

export const toasts = $state<Toast[]>([]);

export function addToast(message: string, type: ToastType = 'info', duration = 2000) {
	const id = crypto.randomUUID();
	toasts.push({ id, message, type });

	setTimeout(() => {
		removeToast(id);
	}, duration);
}

export function removeToast(id: string) {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) {
		toasts.splice(index, 1);
	}
}
