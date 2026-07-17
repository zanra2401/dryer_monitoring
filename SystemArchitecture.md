# System Architecture Diagram - Dryer Monitoring

Berikut adalah kode PlantUML untuk diagram arsitektur sistem aplikasi *Dryer Monitoring*.

```plantuml
@startuml
skinparam componentStyle rectangle
skinparam linetype ortho

title Arsitektur Sistem - Dryer Monitoring

' === AKTOR ===
actor "Admin" as admin
actor "Manager" as manager
actor "Operator" as operator
actor "Client" as client

' === LAYER 1: FRONTEND (Browser) ===
package "Frontend (Browser)" {
  component "Vue.js 3 + Nuxt UI" as vue
  component "Halaman Login" as page_login
  component "Dashboard Monitoring" as page_dashboard
  component "Manajemen Data\n(User, Area, Lot)" as page_manage
  component "Chart.js\n(Grafik Suhu & RH)" as chartjs
  component "Export PDF/Excel\n(jsPDF, html2canvas, ExcelJS)" as export
}

' === LAYER 2: BACKEND (Nitro Server) ===
package "Backend - Nuxt Nitro Server" {

  package "REST API Endpoints" {
    component "/api/auth" as api_auth
    component "/api/user" as api_user
    component "/api/dryarea" as api_area
    component "/api/channel" as api_channel
    component "/api/bin" as api_bin
    component "/api/lot" as api_lot
    component "/api/log" as api_log
    component "/api/report" as api_report
    component "/api/process" as api_process
  }

  package "Server Utils" {
    component "Prisma ORM\n(Query Builder)" as prisma_util
    component "Pino Logger" as pino
    component "Zod Validation" as zod
    component "Telemetry Fetcher\n(ThingSpeak Client)" as telemetry
  }

  package "Background Jobs" {
    component "Cron: Fetch Telemetri\n(Setiap 5 Menit)" as cron_fetch
    component "Cron: Garbage Collector\n(Setiap Tengah Malam)" as cron_gc
  }

  component "Middleware\n(Auth & Role Check)" as middleware
  component "Nuxt Auth Utils\n(Session & Bcrypt)" as auth_module
}

' === LAYER 3: DATABASE ===
database "MariaDB / MySQL\n(dryer_monitoring)" as mariadb {
  component "users" as tb_users
  component "dryer_areas" as tb_areas
  component "channels" as tb_channels
  component "bins" as tb_bins
  component "lots" as tb_lots
  component "bin_logs" as tb_binlogs
  component "lot_mc_logs" as tb_mclogs
  component "dryer_access" as tb_daccess
  component "fetch_error_master\n& fetch_error_details" as tb_errors
}

' === LAYER 4: EXTERNAL SERVICE ===
cloud "ThingSpeak IoT Cloud" as thingspeak {
  component "Channel API\n(Sensor Data)" as ts_api
}

' === LAYER 5: HARDWARE ===
node "Perangkat IoT di Lapangan" as iot {
  component "Sensor Suhu &\nKelembaban (RH)\nper Bin" as sensor
}

' ===== RELASI AKTOR KE FRONTEND =====
admin --> vue
manager --> vue
operator --> vue
client --> vue

' ===== RELASI FRONTEND INTERNAL =====
vue --> page_login
vue --> page_dashboard
vue --> page_manage
page_dashboard --> chartjs
page_dashboard --> export

' ===== FRONTEND KE BACKEND =====
page_login --> api_auth : Login / Logout
page_dashboard --> api_bin : GET Data Bin
page_dashboard --> api_log : GET/POST Log
page_dashboard --> api_lot : GET/POST Lot
page_dashboard --> api_report : GET Report Data
page_manage --> api_user : CRUD User
page_manage --> api_area : CRUD Area
page_manage --> api_channel : CRUD Channel

' ===== BACKEND INTERNAL =====
api_auth --> auth_module
api_auth --> middleware
api_user --> prisma_util
api_area --> prisma_util
api_channel --> prisma_util
api_bin --> prisma_util
api_lot --> prisma_util
api_log --> prisma_util
api_log --> zod
api_report --> prisma_util

cron_fetch --> telemetry
cron_gc --> prisma_util
telemetry --> prisma_util
telemetry --> pino

' ===== BACKEND KE DATABASE =====
prisma_util --> mariadb : Query SQL

' ===== BACKEND KE THINGSPEAK =====
telemetry --> ts_api : HTTP GET\n(Fetch Sensor Data)

' ===== IOT KE THINGSPEAK =====
sensor --> ts_api : Upload Data\n(Suhu & RH)

@enduml
```

## Penjelasan Arsitektur

### 1. Frontend (Browser)
Pengguna mengakses sistem melalui browser. Antarmuka dibangun menggunakan **Vue.js 3** dengan komponen **Nuxt UI**. Data sensor divisualisasikan menggunakan **Chart.js**, dan laporan bisa diekspor ke **PDF** (jsPDF) atau **Excel** (ExcelJS).

### 2. Backend (Nuxt Nitro Server)
Server berjalan di atas **Nitro** (engine bawaan Nuxt). Terdiri dari:
- **REST API Endpoints**: Menyediakan layanan data untuk auth, user, area, channel, bin, lot, log, dan report.
- **Middleware**: Mengecek sesi login dan hak akses (role) sebelum setiap request diproses.
- **Server Utils**: Berisi Prisma ORM (koneksi ke database), Pino (logging), Zod (validasi input), dan modul Telemetry (pengambilan data dari ThingSpeak).
- **Background Jobs (Cron)**: Secara otomatis mengambil data sensor dari ThingSpeak setiap 5 menit, serta membersihkan data sementara (ephemeral) setiap tengah malam.

### 3. Database (MariaDB/MySQL)
Seluruh data disimpan di database relasional **MariaDB**. Tabel utama meliputi: `users`, `dryer_areas`, `channels`, `bins`, `lots`, `bin_logs`, `lot_mc_logs`, `dryer_access`, dan `fetch_error_master/details`.

### 4. ThingSpeak IoT Cloud
**ThingSpeak** adalah layanan cloud IoT yang menerima data dari sensor di lapangan. Server backend secara berkala menarik (fetch) data terbaru dari ThingSpeak melalui API-nya.

### 5. Perangkat IoT (Sensor)
Sensor suhu dan kelembaban (RH) yang terpasang pada setiap **Bin** dryer di lapangan mengirimkan data secara periodik ke ThingSpeak Cloud.
