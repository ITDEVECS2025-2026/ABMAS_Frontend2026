# Welcome to ABMAS FRONTEND 👋

# Project Structure 📂 
 ```bash
app/
├── _layout.tsx
│
├── (main)/
│   ├── _layout.tsx
│   ├── index.tsx --> homepage
│   ├── history.tsx --> history page menu
│   └── monitoring.tsx --> monitoring page menu
│
└── (features)/
    ├── _layout.tsx
    ├── (lahan)/ --> page input lahan baru
    ├── (sensor)/ --> tampilan sensor
    ├── (lokasi)/ --> page update lokasi
    ├── (rekomendasi)/ --> page rekomendasi jagung & padi
    ├── (setting)/ --> page pengaturan 
    ├── (history)/ --> komponen history page
    ├── (monitoring)/ --> fitur / page pendukung monitoring baik yang tersimpan maupun tidak
    └── (varietas)/ --> page data pemupukan
components/
├── navbar/
│   └── bottomNavar.tsx --> Navigation Bar
│
└── sensor/ --> Kondisi Sensor Card
    ├── SensorCardGrid.tsx 
    └── SensorMetricCard.tsx 
lib/ --> Integrasi dengan server
├── api.ts
├── config.ts
└── socket.ts
store/
└── sensorContext.tsx
utils/
└── mapPayload.ts
└── ruleEngine.ts --> Rule base rekomendasi pemupukan
constants/
└── index.ts
└── pupukData.ts
styles/
└── assets/ --> folder untuk meletakkan gambar / icon
.env
 ```

# Tech Stack ⚡
-  React Native (Expo) → Base framework
-  NativeWind → TailwindCSS for React Native
-  Gluestack UI → Scalable UI components & design system 
-  TypeScript → Strong typing & maintainability

# UI Components 🖼️
📍 Device Components (components/sensor)
-  SensorMetricCard.tsx → Kartu metrik kondisi tanah (N, P, K, EC, pH, Suhu, Kelembaban), layout & satuan otomatis menyesuaikan tipe metrik
-  SensorCardGrid.tsx → Kartu ringkasan sensor (battery, LoRa status) di daftar sensor
How to use:
```bash
import SensorCard from "@/components/sensor/SensorCardGrid";

return(
<SensorCard sensorId={sensor.id} />
)
```

📍 Responsive Utility (utils/scale.ts)
Semua ukuran dari Figma (referensi lebar 412px) wajib dibungkus scale() supaya proporsional di semua device:
```bash
import { scale } from "../../utils/scale";

width: scale(105),
fontSize: scale(17.028),
```
📍 Screen Header(components/ui/ScreenHeader.tsx)
Konsistensi header page berisikan nama page dan back arrow button
How to use:
```bash
import ScreenHeader from "../../components/ui/ScreenHeader";

return(
<ScreenHeader title="Sensor 1" />
)
```

📍 UI Primitives (components/ui)
button/ → Custom Button (NativeWind + Gluestack)
text/ → Typography system
spinner/ → Loading indicator
vstack/ → Vertical stack layout
gluestack-ui-provider/ → Theme provider
 fyi : you can add another Component using command :
       - npx gluestack-ui add <Components>
       
# Folder 🏠
📍 app/(main)
Page inti yang memerlukan navigation bar

📍 app/(features)
page dan fitur pendukung flow aplikasi hingga mencapai rekomendasi

📍 utils/ruleEngine.tsx
rule base yang digunakan untuk rekomendasi pemupukan, terintegrasi dengan page rekomendasi dan data dari sensor

# Font 
-  PoppinsLight: Poppins_300Light,
-  PoppinsRegular: Poppins_400Regular,
-  PoppinsMedium: Poppins_500Medium,
-  PoppinsSemiBold: Poppins_600SemiBold,
-  PoppinsBold: Poppins_700Bold,
How to use:
```bash
<Text
 style={{
 color: "#FFFFFF",
 fontFamily: "PoppinsBold",
 }}
>
```

# Colors 
Tidak ada warna yang ditambahkan dalam design system

# Sizing (Responsive All Device Android)
	Semua angka px dari Figma dibungkus scale()
 example:
 ```bash
width: scale(105),
fontSize: scale(17.028),
```

# Integrasi Server
- Alamat server dikonfigurasi melalui file .env:
- URL server dikelola secara terpusat melalui: services/config.ts

📍Alur Pengambilan Data Sensor
```bash
Server
   │
   ▼
services/api.ts
   │
   │ fetchInitialSensors()
   ▼
utils/mapPayload.ts
   │
   │ mapNode()
   ▼
store/sensorContext.tsx
   │
   ▼
Monitoring Page
   │
   ▼
SensorCard / MetricCard
   │
   ▼
Tampilan Data Sensor
```
- api.ts: Bertugas mengambil data sensor awal dari server menggunakan HTTP request.
- Data yang diterima kemudian diproses menggunakan mapNode().
- mapPayload.ts: Bertugas mengubah struktur data mentah dari server menjadi struktur Sensor yang digunakan oleh aplikasi.

📍Real-Time Sensor Data
Aplikasi menggunakan Socket.IO untuk menerima pembaruan data sensor secara real-time.
Alurnya:
```bash
Server
   │
   ▼
Socket.IO (/live)
   │
   ▼
sensor:update
   │
   ▼
mapPayload()
   │
   ▼
SensorContext
   │
   ▼
SensorCard
   │
   ▼
UI diperbarui secara otomatis
```
- Koneksi Socket.IO dikelola melalui: services/socket.ts

# Get started
1. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Pastikan dependency tambahan sudah terpasang (untuk ScreenHeader & responsive layout)
   ```bash
   npx expo install expo-linear-gradient react-native-safe-area-context
   ```
   
3. Start the app

   ```bash
   npx expo start
   ```
   
4. Build APK (for Android)
    ```bash
   eas build -p android --profile preview
    ```
