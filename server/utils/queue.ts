import { Queue } from 'bullmq';

/**
 * Konfigurasi koneksi TCP Redis yang digunakan bersama 
 * oleh Queue, Worker, dan QueueEvents.
 */
export const redisConnectionOptions = {
    host: '127.0.0.1', 
    port: 6379,
    maxRetriesPerRequest: null, // Parameter mutlak yang diwajibkan oleh BullMQ
};

/**
 * Inisialisasi dan ekspor instans Queue sebagai objek tunggal (Singleton).
 * Modul apa pun yang mengimpor 'sensorQueue' ini akan berbagi referensi memori yang sama.
 */
export const sensorQueue = new Queue('SensorFetchQueue', {
    connection: redisConnectionOptions,
    defaultJobOptions: {
        attempts: 3, // 1 eksekusi normal + 2 kali retri jika terjadi kegagalan API
        backoff: { 
            type: 'fixed', 
            delay: 5 * 60 * 1000 // Jeda penundaan 5 menit sebelum mengeksekusi retri otomatis
        },
        removeOnComplete: true, // Data job yang sukses akan langsung dihapus untuk menghemat RAM Redis
    }
});