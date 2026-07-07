export const getCardClassByStatus = (status_bin: string) => {
    switch (status_bin) {
        case 'DRIED':
            return 'border-red-600 bg-red-500 dark:border-red-500 dark:bg-red-900/20 text-white';
        case 'DOWNAIR':
            return 'border-blue-600 bg-blue-700 text-white dark:border-blue-500 text-black dark:bg-blue-900/20';
        case 'UPAIR':
            return 'border-yellow-600 bg-yellow-200 dark:border-yellow-500 dark:bg-yellow-900/20';
        default:
            return 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800';
    }
};

