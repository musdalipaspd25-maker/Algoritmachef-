import { LevelConfig, OrderTicket } from '../types/game';

/**
 * Generator bilangan acak deterministik (Linear Congruential Generator)
 * Digunakan agar urutan pesanan acak pada Level 6 konsisten setiap kali dimainkan.
 */
function generateSeededOrders(seed: number, count: number): OrderTicket[] {
  let state = seed;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  const orders: OrderTicket[] = [];
  for (let i = 1; i <= count; i++) {
    const r1 = nextRand();
    const r2 = nextRand();
    const isSpicy = r1 > 0.42;
    const isVip = r2 > 0.55;
    orders.push({
      id: `L6-ORD-${i}`,
      dishName: isVip
        ? isSpicy
          ? 'Nasi Goreng Spesial Pedas VIP'
          : 'Nasi Goreng Spesial VIP'
        : isSpicy
          ? 'Nasi Goreng Pedas'
          : 'Nasi Goreng Klasik',
      emoji: isVip ? '👑🍛' : isSpicy ? '🌶️🍛' : '🍛',
      isSpicy,
      isVip,
      mainIngredient: 'Utama',
      requiresPlating: true,
    });
  }
  return orders;
}

/**
 * ============================================================================
 * KONFIGURASI DATA LEVEL (PANDUAN GURU)
 * Guru dapat mengubah judul, batas waktu, target porsi, stok bahan,
 * jumlah blok optimal, petunjuk bertahap, serta kuis refleksi di objek ini.
 * ============================================================================
 */
export const LEVELS_CONFIG: LevelConfig[] = [
  {
    id: 1,
    title: 'Nasi Goreng Klasik',
    conceptTag: 'Sekuens (Urutan)',
    difficulty: 'Dasar',
    recipeName: 'Nasi Goreng Spesial',
    recipeEmoji: '🍳',
    description:
      'Pelajari cara menyusun langkah algoritma secara berurutan (sekuens) dari bahan mentah hingga siap disajikan.',
    targetPortions: 1,
    timeLimitSeconds: 45,
    initialStock: {
      Utama: 5,
      Sayur: 5,
      Cabai: 3,
      'Garnish VIP': 2,
    },
    optimalBlockCount: 5,
    orders: [
      {
        id: 'L1-ORD-1',
        dishName: 'Nasi Goreng Klasik',
        emoji: '🍛',
        isSpicy: false,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
    ],
    recipeVisualSteps: [
      '1. Ambil Bahan [Utama] (Nasi & Telur)',
      '2. Potong bahan & bumbu',
      '3. Masak di wajan panas',
      '4. Tata di Piring saji',
      '5. Sajikan ke pelanggan',
    ],
    decompositionPrompt: 'Pecah resep Nasi Goreng menjadi 5 langkah berurutan.',
    subtaskColumns: ['Sub-tugas: Masak Nasi Goreng'],
    decompositionSteps: [
      { id: 'l1-s1', label: 'Ambil Bahan Utama (Nasi & Telur)', subtaskGroup: 'Sub-tugas: Masak Nasi Goreng' },
      { id: 'l1-s2', label: 'Potong bahan pelengkap', subtaskGroup: 'Sub-tugas: Masak Nasi Goreng' },
      { id: 'l1-s3', label: 'Masak di atas wajan', subtaskGroup: 'Sub-tugas: Masak Nasi Goreng' },
      { id: 'l1-s4', label: 'Tata di Piring saji', subtaskGroup: 'Sub-tugas: Masak Nasi Goreng' },
      { id: 'l1-s5', label: 'Sajikan ke meja pelanggan', subtaskGroup: 'Sub-tugas: Masak Nasi Goreng' },
    ],
    hints: [
      'Petunjuk 1: Selalu mulai dengan mengambil bahan dari rak sebelum memotong.',
      'Petunjuk 2: Bahan harus dipotong dulu sebelum dimasak agar matang merata.',
      'Petunjuk 3: Setelah dimasak, tata di piring lalu sajikan pesanan!',
    ],
    reflectionQuiz: {
      question:
        'Mengapa urutan (sekuens) sangat penting saat menyusun algoritma untuk robot koki?',
      options: [
        'Karena robot menjalankan instruksi satu per satu secara berurutan dari atas ke bawah.',
        'Karena robot hanya bisa memasak jika warnanya biru.',
        'Agar jumlah bahan di gudang otomatis bertambah.',
      ],
      correctIndex: 0,
      explanation:
        'Tepat! Sekuens berarti langkah dieksekusi berurutan. Memasak sebelum mengambil bahan akan menyebabkan error.',
    },
  },
  {
    id: 2,
    title: 'Paket Bento Duo',
    conceptTag: 'Dekomposisi + Sekuens',
    difficulty: 'Dasar',
    recipeName: 'Tumis Sayur & Ayam Panggang',
    recipeEmoji: '🍱',
    description:
      'Ada 2 menu berbeda dalam satu paket! Pecah masalah besar menjadi 2 sub-tugas yang jelas dan berurutan.',
    targetPortions: 2,
    timeLimitSeconds: 60,
    initialStock: {
      Utama: 5,
      Sayur: 5,
      Cabai: 2,
      'Garnish VIP': 2,
    },
    optimalBlockCount: 10,
    orders: [
      {
        id: 'L2-ORD-1',
        dishName: 'Tumis Sayur Segar',
        emoji: '🥗',
        isSpicy: false,
        isVip: false,
        mainIngredient: 'Sayur',
        requiresPlating: true,
      },
      {
        id: 'L2-ORD-2',
        dishName: 'Ayam Panggang Madu',
        emoji: '🍗',
        isSpicy: false,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
    ],
    recipeVisualSteps: [
      'Sub-tugas 1 (Tumis Sayur): Ambil [Sayur] -> Potong -> Masak -> Tata di Piring -> Sajikan',
      'Sub-tugas 2 (Ayam Panggang): Ambil [Utama] -> Potong -> Masak -> Tata di Piring -> Sajikan',
    ],
    decompositionPrompt:
      'Kelompokkan langkah menjadi 2 sub-tugas: siapkan Tumis Sayur terlebih dahulu, lalu Ayam Panggang.',
    subtaskColumns: ['Sub-tugas 1: Tumis Sayur', 'Sub-tugas 2: Ayam Panggang'],
    decompositionSteps: [
      { id: 'l2-s1', label: 'Ambil Bahan Sayur', subtaskGroup: 'Sub-tugas 1: Tumis Sayur' },
      { id: 'l2-s2', label: 'Potong & Masak Sayur', subtaskGroup: 'Sub-tugas 1: Tumis Sayur' },
      { id: 'l2-s3', label: 'Tata Sayur & Sajikan', subtaskGroup: 'Sub-tugas 1: Tumis Sayur' },
      { id: 'l2-s4', label: 'Ambil Bahan Utama (Ayam)', subtaskGroup: 'Sub-tugas 2: Ayam Panggang' },
      { id: 'l2-s5', label: 'Potong & Masak Ayam', subtaskGroup: 'Sub-tugas 2: Ayam Panggang' },
      { id: 'l2-s6', label: 'Tata Ayam & Sajikan', subtaskGroup: 'Sub-tugas 2: Ayam Panggang' },
    ],
    hints: [
      'Petunjuk 1: Selesaikan semua langkah Tumis Sayur di Sub-tugas 1 terlebih dahulu.',
      'Petunjuk 2: Di editor program, pesanan ke-1 memakai Ambil Bahan [Sayur], pesanan ke-2 memakai Ambil Bahan [Utama].',
      'Petunjuk 3: Setiap porsi tetap mengikuti alur Ambil -> Potong -> Masak -> Tata di Piring -> Sajikan.',
    ],
    reflectionQuiz: {
      question: 'Apa manfaat utama teknik dekomposisi pada Level 2 ini?',
      options: [
        'Menghilangkan semua bahan masakan.',
        'Memecah pesanan kompleks (2 menu) menjadi sub-tugas kecil yang mudah dikerjakan.',
        'Membuat robot bekerja tanpa instruksi.',
      ],
      correctIndex: 1,
      explanation:
        'Benar! Dekomposisi memecah masalah besar menjadi bagian kecil yang terstruktur sehingga lebih mudah diprogram.',
    },
  },
  {
    id: 3,
    title: '5 Porsi Mie Goreng Kilat',
    conceptTag: 'Perulangan (Loop)',
    difficulty: 'Dasar',
    recipeName: 'Mie Goreng Spesial x5',
    recipeEmoji: '🍜',
    description:
      'Pelanggan rombongan memesan 5 porsi identik! Gunakan blok Perulangan (Loop) agar kode programmu singkat dan efisien.',
    targetPortions: 5,
    timeLimitSeconds: 65,
    initialStock: {
      Utama: 8,
      Sayur: 5,
      Cabai: 3,
      'Garnish VIP': 2,
    },
    optimalBlockCount: 6,
    requireLoop: true,
    orders: Array.from({ length: 5 }, (_, idx) => ({
      id: `L3-ORD-${idx + 1}`,
      dishName: `Mie Goreng Porsi #${idx + 1}`,
      emoji: '🍜',
      isSpicy: false,
      isVip: false,
      mainIngredient: 'Utama',
      requiresPlating: true,
    })),
    recipeVisualSteps: [
      'Ulangi sebanyak 5 kali:',
      '  1. Ambil Bahan [Utama]',
      '  2. Potong',
      '  3. Masak',
      '  4. Tata di Piring',
      '  5. Sajikan',
    ],
    decompositionPrompt:
      'Kenali pola berulang! Susun 1 pola memasak mie goreng dan tentukan jumlah pengulangannya.',
    subtaskColumns: ['Sub-tugas: Pola Berulang (x5)'],
    decompositionSteps: [
      { id: 'l3-s1', label: 'Tentukan jumlah pengulangan: 5 kali', subtaskGroup: 'Sub-tugas: Pola Berulang (x5)' },
      { id: 'l3-s2', label: 'Ambil Bahan Utama & Potong', subtaskGroup: 'Sub-tugas: Pola Berulang (x5)' },
      { id: 'l3-s3', label: 'Masak & Tata di Piring', subtaskGroup: 'Sub-tugas: Pola Berulang (x5)' },
      { id: 'l3-s4', label: 'Sajikan porsi saat ini', subtaskGroup: 'Sub-tugas: Pola Berulang (x5)' },
    ],
    hints: [
      'Petunjuk 1: Jangan susun 25 blok berurutan! Tarik blok hijau "Ulangi [5] kali".',
      'Petunjuk 2: Masukkan 5 blok aksi (Ambil Bahan [Utama], Potong, Masak, Tata di Piring, Sajikan) ke dalam blok Ulangi.',
      'Petunjuk 3: Total blok optimal hanya 6 blok saja!',
    ],
    reflectionQuiz: {
      question:
        'Jika restoran mendapat 50 pesanan yang sama persis, blok apa yang paling efisien?',
      options: [
        'Menyusun 250 blok Aksi secara manual.',
        'Blok Perulangan (Loop) dengan jumlah 50 kali.',
        'Blok Kondisi tanpa aksi memasak.',
      ],
      correctIndex: 1,
      explanation:
        'Mantap! Perulangan (Loop) menghemat jumlah blok dan meminimalkan kesalahan penulisan program.',
    },
  },
  {
    id: 4,
    title: 'Sup Hangat Saat Stok Menipis',
    conceptTag: 'Kondisi (If-Else)',
    difficulty: 'Menengah',
    recipeName: 'Sup Ayam Hangat x3',
    recipeEmoji: '🍲',
    description:
      'Stok Bahan Utama di rak dapur hanya tersisa 2 porsi, sedangkan pesanan ada 3! Gunakan kondisi If-Else untuk mengambil Stok Gudang saat bahan habis.',
    targetPortions: 3,
    timeLimitSeconds: 65,
    initialStock: {
      Utama: 2, // Sengaja hanya 2 untuk memicu kondisi bahan habis di porsi ke-3!
      Sayur: 5,
      Cabai: 2,
      'Garnish VIP': 2,
    },
    optimalBlockCount: 8,
    requireLoop: true,
    requireCondition: true,
    orders: Array.from({ length: 3 }, (_, idx) => ({
      id: `L4-ORD-${idx + 1}`,
      dishName: `Sup Ayam Porsi #${idx + 1}`,
      emoji: '🍲',
      isSpicy: false,
      isVip: false,
      mainIngredient: 'Utama',
      requiresPlating: true,
    })),
    recipeVisualSteps: [
      'Ulangi 3 kali:',
      '  Jika [bahan tersedia] -> Ambil Bahan [Utama]',
      '  Jika Tidak -> Ambil Bahan [Stok Gudang]',
      '  Potong -> Masak -> Tata di Piring -> Sajikan',
    ],
    decompositionPrompt:
      'Pecah alur dengan cabang keputusan saat memeriksa ketersediaan stok bahan.',
    subtaskColumns: ['Sub-tugas 1: Cek Stok (If-Else)', 'Sub-tugas 2: Proses Masak'],
    decompositionSteps: [
      { id: 'l4-s1', label: 'Periksa apakah Bahan Utama tersedia', subtaskGroup: 'Sub-tugas 1: Cek Stok (If-Else)' },
      { id: 'l4-s2', label: 'Jika tersedia ambil dari Rak Utama, jika habis ambil Stok Gudang', subtaskGroup: 'Sub-tugas 1: Cek Stok (If-Else)' },
      { id: 'l4-s3', label: 'Potong & Masak bahan sup', subtaskGroup: 'Sub-tugas 2: Proses Masak' },
      { id: 'l4-s4', label: 'Tata di Piring & Sajikan', subtaskGroup: 'Sub-tugas 2: Proses Masak' },
    ],
    hints: [
      'Petunjuk 1: Gunakan "Ulangi [3] kali" sebagai pembungkus luar.',
      'Petunjuk 2: Di dalam Loop, pasang blok ungu "Jika [bahan tersedia] ... Jika Tidak ...".',
      'Petunjuk 3: Cabang Jika: Ambil Bahan [Utama]. Cabang Jika Tidak: Ambil Bahan [Stok Gudang]. Lalu Potong, Masak, Tata di Piring, Sajikan.',
    ],
    reflectionQuiz: {
      question:
        'Apa yang terjadi jika kita tidak menambahkan blok kondisi If-Else saat stok di rak hanya 2 untuk 3 pesanan?',
      options: [
        'Robot otomatis membeli bahan ke pasar.',
        'Robot mengalami error kehabisan bahan pada pesanan ke-3.',
        'Waktu menjadi tidak terbatas.',
      ],
      correctIndex: 1,
      explanation:
        'Betul! Kondisi If-Else membuat robot cerdas memilih jalur cadangan (Stok Gudang) saat stok utama habis.',
    },
  },
  {
    id: 5,
    title: 'Antrean Pesanan Campuran',
    conceptTag: 'Loop + If-Else',
    difficulty: 'Menengah',
    recipeName: 'Rice Bowl Biasa & Pedas',
    recipeEmoji: '🌶️',
    description:
      'Ada 4 pesanan masuk dengan selera berbeda (Biasa dan Pedas). Robot harus menambah Cabai HANYA jika pesanan meminta pedas!',
    targetPortions: 4,
    timeLimitSeconds: 75,
    initialStock: {
      Utama: 6,
      Sayur: 5,
      Cabai: 5,
      'Garnish VIP': 2,
    },
    optimalBlockCount: 8,
    requireLoop: true,
    requireCondition: true,
    orders: [
      {
        id: 'L5-ORD-1',
        dishName: 'Rice Bowl Original',
        emoji: '🍚',
        isSpicy: false,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
      {
        id: 'L5-ORD-2',
        dishName: 'Rice Bowl Pedas Level 3',
        emoji: '🌶️',
        isSpicy: true,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
      {
        id: 'L5-ORD-3',
        dishName: 'Rice Bowl Original',
        emoji: '🍚',
        isSpicy: false,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
      {
        id: 'L5-ORD-4',
        dishName: 'Rice Bowl Pedas Gila',
        emoji: '🌶️',
        isSpicy: true,
        isVip: false,
        mainIngredient: 'Utama',
        requiresPlating: true,
      },
    ],
    recipeVisualSteps: [
      'Ulangi 4 kali:',
      '  1. Ambil Bahan [Utama]',
      '  2. Jika [pesanan pedas] -> Ambil Bahan [Cabai]',
      '  3. Potong -> Masak -> Tata di Piring -> Sajikan',
    ],
    decompositionPrompt:
      'Pisahkan langkah umum yang selalu dikerjakan dengan langkah kondisional khusus pesanan pedas.',
    subtaskColumns: ['Sub-tugas 1: Siapkan Bahan', 'Sub-tugas 2: Masak & Saji'],
    decompositionSteps: [
      { id: 'l5-s1', label: 'Ambil Bahan Utama untuk setiap porsi', subtaskGroup: 'Sub-tugas 1: Siapkan Bahan' },
      { id: 'l5-s2', label: 'Cek Jika pesanan pedas, tambah Cabai', subtaskGroup: 'Sub-tugas 1: Siapkan Bahan' },
      { id: 'l5-s3', label: 'Potong & Masak semua bahan', subtaskGroup: 'Sub-tugas 2: Masak & Saji' },
      { id: 'l5-s4', label: 'Tata di Piring & Sajikan', subtaskGroup: 'Sub-tugas 2: Masak & Saji' },
    ],
    hints: [
      'Petunjuk 1: Gunakan blok "Ulangi [4] kali" atau "Ulangi selama [pesanan ada]".',
      'Petunjuk 2: Setelah Ambil Bahan [Utama], pasang "Jika [pesanan pedas]" dengan isi "Ambil Bahan [Cabai]" (cabang Jika Tidak boleh dikosongkan).',
      'Petunjuk 3: Lanjutkan dengan Potong -> Masak -> Tata di Piring -> Sajikan di dalam Loop.',
    ],
    reflectionQuiz: {
      question:
        'Mengapa blok "Jika [pesanan pedas]" harus diletakkan DI DALAM blok Perulangan (Loop)?',
      options: [
        'Agar kondisi pedas diperiksa ulang untuk setiap tiket pesanan satu per satu.',
        'Supaya semua pesanan menjadi pedas.',
        'Karena blok biru tidak boleh masuk ke dalam loop.',
      ],
      correctIndex: 0,
      explanation:
        'Tepat sekali! Setiap iterasi loop memproses 1 tiket, sehingga pengecekan kondisi harus dilakukan di setiap putaran.',
    },
  },
  {
    id: 6,
    title: 'Jam Sibuk Resto Pintar',
    conceptTag: 'Gabungan + Efisiensi',
    difficulty: 'Tantangan',
    recipeName: 'Menu Campuran VIP & Pedas',
    recipeEmoji: '👑',
    description:
      'Tantangan puncak! 5 pesanan acak (Biasa, Pedas, dan VIP) dengan stok rak terbatas (hanya 3). Gabungkan Loop dan Nested/Multiple If-Else secara efisien!',
    targetPortions: 5,
    timeLimitSeconds: 70,
    initialStock: {
      Utama: 3, // Habis setelah 3 pesanan, harus pakai Stok Gudang!
      Sayur: 5,
      Cabai: 5,
      'Garnish VIP': 5,
    },
    optimalBlockCount: 11,
    requireLoop: true,
    requireCondition: true,
    randomSeed: 202604,
    orders: generateSeededOrders(202604, 5),
    recipeVisualSteps: [
      'Ulangi selama [pesanan ada] (atau 5 kali):',
      '  1. Jika [bahan habis] -> Ambil [Stok Gudang], Jika Tidak -> Ambil [Utama]',
      '  2. Jika [pesanan pedas] -> Ambil Bahan [Cabai]',
      '  3. Potong -> Masak -> Tata di Piring',
      '  4. Jika [pesanan VIP] -> Ambil Bahan [Garnish VIP]',
      '  5. Sajikan',
    ],
    decompositionPrompt:
      'Pecah tantangan jam sibuk menjadi 3 sub-tugas berurutan di dalam siklus loop.',
    subtaskColumns: [
      'Sub-tugas 1: Cek Stok & Rasa',
      'Sub-tugas 2: Olah Masakan',
      'Sub-tugas 3: Sentuhan VIP & Saji',
    ],
    decompositionSteps: [
      { id: 'l6-s1', label: 'Cek stok rak: pakai Utama atau Stok Gudang', subtaskGroup: 'Sub-tugas 1: Cek Stok & Rasa' },
      { id: 'l6-s2', label: 'Cek pesanan pedas: tambah Cabai jika perlu', subtaskGroup: 'Sub-tugas 1: Cek Stok & Rasa' },
      { id: 'l6-s3', label: 'Potong, Masak, dan Tata di Piring', subtaskGroup: 'Sub-tugas 2: Olah Masakan' },
      { id: 'l6-s4', label: 'Cek pesanan VIP: tambah Garnish VIP', subtaskGroup: 'Sub-tugas 3: Sentuhan VIP & Saji' },
      { id: 'l6-s5', label: 'Sajikan ke antrean loket', subtaskGroup: 'Sub-tugas 3: Sentuhan VIP & Saji' },
    ],
    hints: [
      'Petunjuk 1: Mulai dengan "Ulangi selama [pesanan ada]" atau "Ulangi [5] kali".',
      'Petunjuk 2: Pertama cek stok ("Jika [bahan habis] -> Ambil [Stok Gudang], Jika Tidak -> Ambil [Utama]"). Lalu cek "Jika [pesanan pedas] -> Ambil [Cabai]".',
      'Petunjuk 3: Setelah Potong, Masak, Tata di Piring, cek "Jika [pesanan VIP] -> Ambil [Garnish VIP]", terakhir Sajikan!',
    ],
    reflectionQuiz: {
      question:
        'Dalam algoritma kompleks seperti Level 6, bagaimana cara memastikan program tetap ringkas dan mudah di-debug?',
      options: [
        'Menggabungkan dekomposisi, perulangan, dan seleksi kondisi secara terstruktur.',
        'Menghapus semua blok kondisi dan menebak pesanan.',
        'Mengulang semua blok secara manual tanpa loop.',
      ],
      correctIndex: 0,
      explanation:
        'Luar biasa! Pemecahan masalah (dekomposisi) + Loop + If-Else adalah fondasi utama berpikir komputasional.',
    },
  },
];
