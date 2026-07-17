# Usecase Diagram: Role Manager dan Client (View Only)

Berikut adalah kode PlantUML untuk diagram *Use Case* di mana **Manager** dan **Client** hanya bertindak sebagai pemantau (*View Only*) di dalam sistem *Dryer Monitoring*.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Manager" as manager
actor "Client / Operator" as client

rectangle "Sistem Dryer Monitoring (View Only)" {
  
  usecase "Login ke dalam Sistem" as UC_Login
  usecase "Melihat Dashboard Monitoring" as UC_Dashboard
  usecase "Melihat Detail Data Lot" as UC_Lot
  usecase "Melihat Riwayat Moisture Content (MC)" as UC_MC
  usecase "Mencetak/Export Laporan (PDF/Excel)" as UC_Report

}

' Relasi Client (Akses terbatas)
client --> UC_Login
client --> UC_Dashboard : Sesuai Hak Akses (Daccess)
client --> UC_Lot : Sesuai Hak Akses
client --> UC_MC : Sesuai Hak Akses
client --> UC_Report : Sesuai Hak Akses

' Relasi Manager (Akses melihat ke seluruh data)
manager --> UC_Login
manager --> UC_Dashboard : Semua Area
manager --> UC_Lot : Semua Area
manager --> UC_MC : Semua Area
manager --> UC_Report : Semua Area

@enduml
```

## Penjelasan Singkat
Pada skenario **View Only** ini, tidak ada aktivitas penambahan, pengubahan, atau penghapusan data yang dilakukan oleh Manager maupun Client:
1.  **Client**: Hanya bisa login dan memantau (melihat *dashboard*, data lot, dan riwayat kadar air/MC), serta mengekspor laporan **khusus untuk area dryer** yang memang diberikan akses kepadanya.
2.  **Manager**: Memiliki fungsi yang sama persis (hanya melihat dan mencetak laporan), namun Manager memiliki hak akses *read-only* secara **global** untuk memantau seluruh area *dryer* yang ada di dalam sistem tanpa terkecuali.
