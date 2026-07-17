export const getCardClassByStatus = (status_bin: string) => {
    switch (status_bin) {
        case 'COMPLETED':
            return 'border-red-500 bg-red-200 text-red-950 dark:border-red-600 dark:bg-red-900/20 dark:text-red-100';
        case 'WAITING_TO_SHELLING':
            return 'border-green-500 bg-green-200 text-green-950 dark:border-green-600 dark:bg-green-900/20 dark:text-green-100';
        case 'DOWNAIR':
            return 'border-blue-500 bg-blue-200 text-blue-950 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-100';
        case 'UPAIR':
            return 'border-amber-500 bg-amber-200 text-amber-950 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-100';
        default:
            return 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
    }
};

export const getColor = (status_bin: string) => {
    switch (status_bin) {
        case 'COMPLETED':
            return 'text-red-500 dark:text-red-400';
        case 'WAITING_TO_SHELLING':
            return 'text-green-500 dark:text-green-400';
        case 'DOWNAIR':
            return 'text-blue-500 dark:text-blue-400';
        case 'UPAIR':
            return 'text-amber-500 dark:text-amber-400';
        default:
            return 'text-slate-500 dark:text-slate-400';
    }
};

export const getBgColor = (status_bin: string) => {
    switch (status_bin) {
        case 'COMPLETED':
            return 'bg-red-500 dark:bg-red-400';
        case 'WAITING_TO_SHELLING':
            return 'bg-green-500 dark:bg-green-400';
        case 'DOWNAIR':
            return 'bg-blue-500 dark:bg-blue-400';
        case 'UPAIR':
            return 'bg-amber-500 dark:bg-amber-400';
        default:
            return 'bg-slate-500 dark:bg-slate-400';
    }
};

export const getColorClassNuxt = (status_bin: string) => {
    switch (status_bin) {
        case 'COMPLETED':
            return 'error';
        case 'WAITING_TO_SHELLING':
            return 'success';
        case 'DOWNAIR':
            return 'info';
        case 'UPAIR':
            return 'warning';
        default:
            return 'neutral';
    }
};