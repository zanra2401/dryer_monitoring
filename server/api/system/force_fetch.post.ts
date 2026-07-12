import { runTelemetryFetch } from '~~/server/utils/telemetry';

export default defineEventHandler(async (event) => {
    // Only allow Admin or Manager
    const session = event.context.session;
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to force fetch telemetry.'
        });
    }

    try {
        // Trigger manual fetch asynchronously without blocking the response too long,
        // or await it if we want the client to wait for it to finish.
        // The user wants it to show loading, so we await it.
        await runTelemetryFetch(true);
        return { success: true, message: 'Sinkronisasi telemetri berhasil dijalankan.' };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: `Gagal menjalankan sinkronisasi: ${error.message}`
        });
    }
});
