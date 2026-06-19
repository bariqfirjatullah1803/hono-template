# Hono Backend Template - Modular Monolith with DDD

Template backend siap pakai menggunakan **Hono** dan **Cloudflare Workers / Bun** dengan menerapkan prinsip **Domain-Driven Design (DDD)**. Arsitektur ini dirancang sebagai **Modular Monolith** untuk mempermudah skalabilitas dan memastikan sistem **sangat mudah dimigrasikan ke Microservices** di masa depan.

## 🚀 Fitur Utama
- **Domain-Driven Design (DDD):** Pemisahan kode yang ketat berdasarkan ranah bisnis (*Bounded Context*).
- **Modular Monolith Architecture:** Modul mandiri yang meminimalkan *coupling* antar domain bisnis.
- **Type-safe API with OpenAPI:** Validasi *request/response* menggunakan Zod otomatis menghasilkan dokumentasi OpenAPI `/doc`.
- **Functional Error Handling:** Menggunakan `Result` dan `Either` pattern (`left` untuk error, `right` untuk success) menggantikan *try-catch explosion*.

---

## 📂 Struktur Folder

Arsitektur ini membagi kode ke dalam dua bagian utama: `shared` (komponen dasar) dan `modules` (konteks bisnis spesifik).

```text
src/
├── modules/                  # Bounded Contexts (Konteks Bisnis)
│   └── users/                # Contoh Modul Bisnis 'Users'
│       ├── domain/           # LAYER 1: Core Enterprise Business Rules
│       │   ├── User.ts       # Entity / Aggregate Root
│       │   ├── UserEmail.ts  # Value Object (dengan validasi internal)
│       │   └── IUserRepository.ts # Interface Repository (Kontrak)
│       │
│       ├── application/      # LAYER 2: Application Use Cases
│       │   └── CreateUserUseCase.ts # Logika alur aplikasi / orkestrasi
│       │
│       ├── infrastructure/   # LAYER 3: External Utilities / Adapters
│       │   └── InMemoryUserRepository.ts # Implementasi database/state
│       │
│       └── presentation/     # LAYER 4: Interface / Routing HTTP
│           └── UserRoutes.ts # Hono Routes factory (menerima use case)
│
│       └── index.ts          # Composition Root: wiring repository, use case, dan routes
│
├── shared/                   # Komponen Reusable Lintas Modul
│   ├── domain/               # DDD Primitives (Entity, ValueObject, Result)
│   ├── application/          # Base UseCase Interface
│   └── infrastructure/       # Global drivers / database clients
│
└── index.ts                  # Entry Point Utama (Wiring up all modules)
```

---

## 📐 Aturan & Struktur Layer (DDD)

Untuk menjaga agar monolith ini mudah dipotong menjadi microservices kelak, patuhi aturan dependensi berikut (**Dependency Rule**):
*Layer dalam tidak boleh mengetahui apa pun tentang layer luar.*

1. **Domain Layer (`domain/`):** 
   - Pusat dari logika bisnis terpenting Anda.
   - **Haram** mengimpor apa pun dari layer `application`, `infrastructure`, atau `presentation`.
   - Berisi *Entities*, *Value Objects*, dan *Repository Interfaces* (bukan implementasi).

2. **Application Layer (`application/`):**
   - Mengatur alur eksekusi aplikasi (*Use Cases*).
   - Hanya boleh berinteraksi dengan layer `domain`.
   - Menerima DTO (*Data Transfer Object*) polos dan memanggil domain objek untuk mengeksekusi aksi bisnis.

3. **Infrastructure Layer (`infrastructure/`):**
   - Berisi implementasi teknis seperti query database (ORM/D1/Prisma), pemanggilan API eksternal, atau integrasi logger.
   - Mengimplementasikan interface/kontrak yang dibuat di layer `domain`.

4. **Presentation Layer (`presentation/`):**
   - Menangani protokol HTTP (Hono Framework), routing, autentikasi middleware, serta validasi skema input body/query menggunakan Zod OpenAPI.
   - **Tidak boleh langsung mengimport infrastructure**. Route dibuat lewat factory function yang menerima use case dari luar.

5. **Composition Root (`modules/<name>/index.ts`):**
   - Tempat satu-satunya yang menyusun dependency: membuat repository, use case, dan route.
   - Ini menjadi *public API* dari modul, sehingga modul lain hanya mengimport dari file ini.

---

## 🛠️ Cara Menambahkan Modul Baru

Jika Anda ingin menambah konteks bisnis baru (misal: `products` atau `orders`):
1. Buat folder baru di bawah `src/modules/products/` dengan subfolder `domain`, `application`, `infrastructure`, dan `presentation`.
2. Definisikan Entity dan Value Object di `domain/`.
3. Buat Use Case di `application/`.
4. Implementasikan database adapter di `infrastructure/`.
5. Buat HTTP endpoint factory di `presentation/ProductRoutes.ts` (menerima use case lewat dependency).
6. Buat Composition Root di `src/modules/products/index.ts` untuk menyusun repository, use case, dan routes.
7. Daftarkan modul baru ke dalam `src/index.ts` menggunakan `const { productRoutes } = createProductModule(); app.route('/products', productRoutes);`.

---

## 🏁 Memulai Pengembangan

### Install Dependencies
```bash
bun install  # atau npm install / yarn install
```

### Jalankan Local Development
```bash
bun run dev  # atau npm run dev
```

### Akses OpenAPI Docs
Aplikasi ini otomatis membuat spesifikasi OpenAPI 3.0. Anda dapat melihat JSON spesifikasinya di endpoint:
```text
GET http://localhost:8787/doc
```

---

## 🎯 Mengapa Arsitektur ini Mudah Migrasi ke Microservices?

1. **Database Isolation:** Setiap modul hanya berinteraksi dengan database-nya sendiri lewat implementasi Repository-nya. Tidak ada *JOIN SQL* lintas modul di dalam kode. Jika modul `users` perlu data dari modul `orders`, komunikasinya harus lewat Use Case atau Event, bukan query langsung.
2. **Clear Boundaries:** Hanya file `src/modules/<name>/index.ts` yang boleh diimport oleh modul lain. Isi folder `domain`, `application`, `infrastructure`, dan `presentation` tetap tertutup di dalam modul.
3. **Composition Root per Modul:** Wiring dependency (repository → use case → route) dilakukan di `index.ts` modul. Saat migrasi ke microservices, Anda cukup memindahkan folder `src/modules/users` ke repositori baru, mengganti `presentation layer`-nya (misal HTTP/gRPC client), dan sistem baru siap berjalan secara terdistribusi tanpa merusak modul lainnya.
