import { sensorQueue } from "~~/server/utils/queue";

export default defineEventHandler(async () => {
    // Menghitung jumlah presisi tugas di setiap fase memori BullMQ
    const counts = await sensorQueue.getJobCounts(
        'wait', 'active', 'completed', 'failed', 'delayed', 'paused'
    );
    
    // Menarik metadata tugas yang sedang tertunda (delayed)
    const delayedJobs = await sensorQueue.getJobs(['delayed']);

    return {
        statistik_antrean: counts,
        tugas_menunggu: delayedJobs.map(job => ({
            id: job.id,
            target_eksekusi: job.data.targetExecuteTime,
            sisa_waktu_tunggu_ms: job.opts.delay ? (job.timestamp + job.opts.delay) - Date.now() : 0
        }))
    };
});