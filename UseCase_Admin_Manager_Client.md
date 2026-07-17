# Usecase Diagram: Role Admin, Manager, Operator, dan Client

Berikut adalah kode PlantUML untuk diagram *Use Case* yang mencakup 4 role: **Admin** (pengelola penuh), **Manager** (pemantau semua area), **Operator** (penginput data di lapangan), dan **Client** (pemantau area tertentu).

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Admin" as admin
actor "Manager" as manager
actor "Operator" as operator
actor "Client" as client

rectangle "Sistem Dryer Monitoring" {
  
  ' Fitur Umum & Pemantauan
  usecase "Login ke dalam Sistem" as UC_Login
  usecase "Melihat Dashboard Monitoring" as UC_Dashboard
  usecase "Melihat Detail Data Lot" as UC_Lot_View
  usecase "Melihat Riwayat Moisture Content (MC)" as UC_MC_View
  usecase "Mencetak/Export Laporan (PDF/Excel)" as UC_Report
  
  ' Fitur Input Data Lapangan
  usecase "Input Data Lot" as UC_Lot_Input
  usecase "Input Data Moisture Content (MC)" as UC_MC_Input

  ' Fitur Manajemen Khusus Admin
  usecase "Manajemen Pengguna (User)" as UC_User
  usecase "Manajemen Area Dryer & Channel" as UC_Area
  usecase "Manajemen Akses User (Daccess)" as UC_Access
  usecase "Melihat Log Error (Fetch Error)" as UC_Error

}

' --- Relasi Client (View Only Terbatas) ---
client --> UC_Login
client --> UC_Dashboard : Sesuai Akses Area
client --> UC_Lot_View : Sesuai Akses Area
client --> UC_MC_View : Sesuai Akses Area
client --> UC_Report : Sesuai Akses Area

' --- Relasi Operator (Input Data & View Terbatas) ---
operator --> UC_Login
operator --> UC_Dashboard : Sesuai Akses Area
operator --> UC_Lot_View : Sesuai Akses Area
operator --> UC_MC_View : Sesuai Akses Area
operator --> UC_Lot_Input : Sesuai Akses Area
operator --> UC_MC_Input : Sesuai Akses Area
operator --> UC_Report : Sesuai Akses Area

' --- Relasi Manager (View Only Global) ---
manager --> UC_Login
manager --> UC_Dashboard : Semua Area
manager --> UC_Lot_View : Semua Area
manager --> UC_MC_View : Semua Area
manager --> UC_Report : Semua Area

' --- Relasi Admin (Full Access / CRUD) ---
admin --> UC_Login
admin --> UC_Dashboard
admin --> UC_Report
admin --> UC_Lot_View
admin --> UC_MC_View
admin --> UC_Lot_Input
admin --> UC_MC_Input
admin --> UC_User
admin --> UC_Area
admin --> UC_Access
admin --> UC_Error

@enduml
```

## Penjelasan Singkat
1.  **Client**: Hanya bisa *login* dan **memantau** (melihat dashboard, data lot, dan riwayat MC), serta mengekspor laporan. Aksesnya **dibatasi hanya pada area dryer tertentu**.
2.  **Operator**: Bertugas di lapangan. Mereka memiliki akses seperti Client, namun ditambah dengan kemampuan untuk **menginput data** (seperti membuat Data Lot baru atau *update* Moisture Content/MC) pada area yang ditugaskan kepada mereka.
3.  **Manager**: Berperan sebagai pemantau (*View Only*). Manager tidak menginput data, namun mereka bisa melihat seluruh dashboard, riwayat data lot/MC, dan mencetak laporan dari **semua area dryer** tanpa terkecuali.
4.  **Admin**: Memiliki hak akses penuh (*Super User*). Selain bisa menginput dan melihat seluruh data, Admin bisa mengelola akun pengguna, mengatur area & mesin, mengatur hak akses area untuk tiap *user*, dan memantau log sistem.
