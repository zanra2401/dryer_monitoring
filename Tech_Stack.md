# Implementasi Program dan Spesifikasi Teknologi (Tech Stack)

Aplikasi *Dryer Monitoring* ini dibangun menggunakan arsitektur modern berbasis web dengan pemisahan yang jelas antara antarmuka pengguna (Frontend) dan logika server (Backend), namun disatukan dalam satu *framework* *full-stack*. 

Berikut adalah rincian bahasa pemrograman dan teknologi (Tech Stack) yang digunakan di dalam sistem:

## 1. Bahasa Pemrograman
*   **TypeScript / JavaScript**: Bahasa pemrograman utama yang digunakan secara menyeluruh, baik di sisi *frontend* (antarmuka) maupun *backend* (API dan server). TypeScript dipilih untuk memberikan *type safety*, meminimalisir *bug*, dan memudahkan *maintenance* kode di masa depan.

## 2. Frontend (Antarmuka Pengguna)
*   **Vue.js 3**: *Framework* JavaScript yang digunakan untuk membangun antarmuka pengguna yang reaktif dan dinamis.
*   **Nuxt.js (v4)**: *Framework* *full-stack* berbasis Vue.js yang menangani *routing*, SSR (Server-Side Rendering), dan mempermudah struktur proyek.
*   **Nuxt UI (@nuxt/ui)**: *Library* komponen UI siap pakai yang memastikan tampilan antarmuka terlihat modern, konsisten, dan responsif (biasanya terintegrasi dengan Tailwind CSS).
*   **Vue Chart.js (chart.js & vue-chartjs)**: Digunakan untuk memvisualisasikan data pemantauan mesin *dryer* ke dalam bentuk grafik/diagram yang interaktif (misal: grafik suhu, kelembaban, dll).
*   **Vue Datepicker (@vuepic/vue-datepicker)**: Komponen khusus untuk memudahkan pengguna dalam memilih rentang waktu atau tanggal untuk memfilter data.

## 3. Backend (Logika Server & API)
*   **Nitro (Bawaan Nuxt)**: *Engine* server yang digunakan Nuxt untuk menjalankan API (End-point) secara cepat dan efisien.
*   **Node-Cron**: Digunakan untuk membuat jadwal tugas otomatis (*cron job*), misalnya mengambil data secara berkala atau melakukan rekap data di latar belakang.
*   **Pino**: *Library logging* yang sangat cepat untuk mencatat aktivitas server (*log/error*), sehingga memudahkan proses *debugging*.
*   **Zod**: Digunakan untuk melakukan validasi struktur data yang masuk dari pengguna ke API, memastikan data yang diproses sistem selalu benar dan aman.

## 4. Database & Penyimpanan Data
*   **MariaDB / MySQL**: Sistem manajemen basis data relasional (RDBMS) utama yang digunakan untuk menyimpan data pengguna, log pemantauan, dan konfigurasi *dryer*.
*   **Prisma ORM (@prisma/client)**: Alat pemetaan objek-relasional (ORM) yang mempermudah interaksi dan *query* dari backend ke database MariaDB secara aman (*type-safe*).
*   **Redis (ioredis)**: Digunakan sebagai sistem *caching* (penyimpanan data sementara yang sangat cepat) atau antrean memori, berguna agar pembacaan data monitoring real-time tidak membebani database utama.

## 5. Keamanan & Autentikasi
*   **Nuxt Auth Utils & Bcryptjs**: Mengelola sistem *login* pengguna, otentikasi sesi, dan enkripsi kata sandi secara aman sebelum disimpan ke database.

## 6. Fitur Ekspor Data (Laporan)
*   **ExcelJS**: Digunakan di sisi server/klien untuk menghasilkan (*generate*) laporan data monitoring ke dalam format Microsoft Excel (`.xlsx`).
*   **jsPDF & html2canvas**: Digunakan untuk mencetak tampilan grafik atau merekap laporan menjadi format dokumen PDF secara langsung dari *browser*.
