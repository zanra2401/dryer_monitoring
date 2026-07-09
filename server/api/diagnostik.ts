export default defineEventHandler(async () => {
    return {
        status: "BullMQ queue is deprecated. Telemetry is now handled via node-cron passive pulling."
    };
});