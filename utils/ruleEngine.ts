export type Varietas = "padi" | "jagung";
export type JenisPupuk = "tunggal" | "majemuk";
export type RasioNPK = "15:15:15" | "15:12:10";

export interface FarmerInput {
  tanamanDipilih: Varietas;       // "padi" | "jagung"
  luasLahan: number;              // ha
  targetHasilPanen: number;       // t/ha
  jenisPupukDipilih: JenisPupuk;  // "tunggal" | "majemuk"
  rasioNPKDipilih?: RasioNPK;     // opsional, wajib jika majemuk
}

export interface RuleEngineInput {
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
  varietas: Varietas;
  luas: number;           // ha
  targetPanen: number;    // t/ha
  jenisPupuk: JenisPupuk;
  rasioNPK?: RasioNPK;    // wajib jika jenisPupuk === "majemuk"
}

export interface WarningItem {
  status: "OK" | "WARNING";
  pesan: string;
}

export interface DosisPerHa {
  urea: number;
  sp36: number;
  kcl: number;
}

export interface HasilMajemuk {
  npkMajemuk: number;
  limitingFactor: string;
  sisaUrea: number;
  sisaSP36: number;
  sisaKCl: number;
}

export interface JadwalFaseTunggal {
  fase: string;
  urea: number;
  sp36: number;
  kcl: number;
}

export interface JadwalFaseMajemukPadi extends JadwalFaseTunggal {
  npk: number;
  limiting: string;
}

export interface JadwalFaseMajemukJagung {
  fase: string;
  npk: number;
  urea: number;
}

export interface RuleEngineOutput {
  warnings: WarningItem[];
  targetPanen: { nilai: number; produktivitas: string; ureaPerHa: number };
  dosisPerHa: DosisPerHa & { statusP?: string; statusK?: string; penentu?: string };
  totalLahan?: {
    urea: number;
    sp36: number;
    kcl: number;
    npk?: number;
  };
  majemuk?: HasilMajemuk;
  jadwal:
    | JadwalFaseTunggal[]
    | JadwalFaseMajemukPadi[]
    | JadwalFaseMajemukJagung[];
}

// ── HELPERS ──────────────────────────────────────────────────

function r(val: number, dec = 2): number {
  return Math.round(val * 10 ** dec) / 10 ** dec;
}

// ── LAYER 1: WARNING (pH & EC) ────────────────────────────────

function cekWarning(pH: number, EC: number): WarningItem[] {
  const warnings: WarningItem[] = [];

  if (pH < 6.5) {
    warnings.push({ status: "WARNING", pesan: `pH=${pH} < 6.5 => Tambahkan DOLOMIT untuk menaikkan pH` });
  } else if (pH > 7.5) {
    warnings.push({ status: "WARNING", pesan: `pH=${pH} > 7.5 => Tanah alkalin, tambahkan SULFUR` });
  } else {
    warnings.push({ status: "OK", pesan: `pH=${pH} normal (6.5-7.5)` });
  }

  if (EC < 2.0) {
    warnings.push({ status: "OK", pesan: `EC=${EC} < 2 => Normal` });
  } else if (EC <= 3.0) {
    warnings.push({ status: "WARNING", pesan: `EC=${EC} (2-3) => Monitoring salinitas tanaman` });
  } else {
    warnings.push({ status: "WARNING", pesan: `EC=${EC} > 3 => Potensi penurunan produktivitas` });
  }

  return warnings;
}

// ── LAYER 2: TARGET PANEN → UREA DASAR ───────────────────────

function ureaFromTarget(targetPanen: number): { ureaPerHa: number; produktivitas: string } {
  if (targetPanen < 5)  return { ureaPerHa: 200, produktivitas: "rendah (<5 t/ha)" };
  if (targetPanen <= 6) return { ureaPerHa: 275, produktivitas: "sedang (5-6 t/ha)" };
  return                       { ureaPerHa: 350, produktivitas: "tinggi (>6 t/ha)" };
}

// ── LAYER 3: DOSIS PER HA ─────────────────────────────────────

function dosisPadi(P: number, K: number, ureaPerHa: number): DosisPerHa & { statusP: string; statusK: string } {
  let sp36: number, statusP: string;
  if (P < 20)       { sp36 = 100; statusP = "rendah (<20 mg P2O5)"; }
  else if (P <= 40) { sp36 = 75;  statusP = "sedang (20-40 mg P2O5)"; }
  else              { sp36 = 50;  statusP = "tinggi (>40 mg P2O5)"; }

  let kcl: number, statusK: string;
  if (K < 20) { kcl = 50; statusK = "rendah (<20 mg K2O)"; }
  else        { kcl = 0;  statusK = "sedang/tinggi (>=20 mg K2O)"; }

  return { urea: ureaPerHa, sp36, kcl, statusP, statusK };
}

function dosisJagung(P: number, K: number): DosisPerHa & { status: string; penentu: string; nilaiPenentu: number } {
  const val = Math.min(P, K);
  const penentu = P <= K ? "P" : "K";

  let status: string, sp36: number, kcl: number;
  if (val < 20)       { status = "rendah (<20)";   sp36 = 150; kcl = 100; }
  else if (val <= 40) { status = "sedang (20-40)";  sp36 = 125; kcl = 75; }
  else                { status = "tinggi (>40)";    sp36 = 100; kcl = 50; }

  return { urea: 350, sp36, kcl, status, penentu, nilaiPenentu: val };
}

// ── LAYER 4: HITUNG MAJEMUK (global) ─────────────────────────

function hitungMajemuk(
  dosis: DosisPerHa,
  rasioN: number,
  rasioP: number,
  rasioK: number
): HasilMajemuk {
  const N_butuh = dosis.urea * 0.46;
  const P_butuh = dosis.sp36 * 0.36;
  const K_butuh = dosis.kcl  * 0.60;

  const npkDariP = rasioP > 0 ? P_butuh / (rasioP / 100) : Infinity;
  const npkDariK = (rasioK > 0 && K_butuh > 0) ? K_butuh / (rasioK / 100) : Infinity;

  let npkMajemuk: number, limitingFactor: string;
  if (K_butuh === 0) {
    npkMajemuk = npkDariP;
    limitingFactor = "P (K tidak dibutuhkan)";
  } else if (npkDariP <= npkDariK) {
    npkMajemuk = npkDariP;
    limitingFactor = "P";
  } else {
    npkMajemuk = npkDariK;
    limitingFactor = "K";
  }
  npkMajemuk = r(npkMajemuk);

  const N_dari_npk = npkMajemuk * (rasioN / 100);
  const P_dari_npk = npkMajemuk * (rasioP / 100);
  const K_dari_npk = npkMajemuk * (rasioK / 100);

  return {
    npkMajemuk,
    limitingFactor,
    sisaUrea: r(Math.max(0, N_butuh - N_dari_npk) / 0.46),
    sisaSP36: r(Math.max(0, P_butuh - P_dari_npk) / 0.36),
    sisaKCl:  r(Math.max(0, K_butuh - K_dari_npk) / 0.60),
  };
}

// ── JADWAL: PADI TUNGGAL ──────────────────────────────────────

function jadwalPadiTunggal(totalUrea: number, totalSP36: number, totalKCl: number): JadwalFaseTunggal[] {
  return [
    { fase: "8 HST",  urea: r(totalUrea * 0.25), sp36: r(totalSP36 * 1.00), kcl: r(totalKCl * 0.50) },
    { fase: "21 HST", urea: r(totalUrea * 0.50), sp36: 0,                   kcl: 0 },
    { fase: "42 HST", urea: r(totalUrea * 0.25), sp36: 0,                   kcl: r(totalKCl * 0.50) },
  ];
}

// ── JADWAL: PADI MAJEMUK ──────────────────────────────────────

function jadwalPadiMajemuk(
  dosisPerHa: DosisPerHa,
  rasioN: number,
  rasioP: number,
  rasioK: number,
  luas: number
): JadwalFaseMajemukPadi[] {
  const fases = [
    { fase: "8 HST",  pctUrea: 0.25, pctSP36: 1.00, pctKCl: 0.50 },
    { fase: "21 HST", pctUrea: 0.50, pctSP36: 0.00, pctKCl: 0.00 },
    { fase: "42 HST", pctUrea: 0.25, pctSP36: 0.00, pctKCl: 0.50 },
  ];

  return fases.map((f) => {
    const urea_fase = dosisPerHa.urea * f.pctUrea;
    const sp36_fase = dosisPerHa.sp36 * f.pctSP36;
    const kcl_fase  = dosisPerHa.kcl  * f.pctKCl;

    const N_butuh = urea_fase * 0.46;
    const P_butuh = sp36_fase * 0.36;
    const K_butuh = kcl_fase  * 0.60;

    const npkDariP = (rasioP > 0 && P_butuh > 0) ? P_butuh / (rasioP / 100) : Infinity;
    const npkDariK = (rasioK > 0 && K_butuh > 0) ? K_butuh / (rasioK / 100) : Infinity;

    let npkFase: number, limiting: string, N_dari_npk: number, P_dari_npk: number, K_dari_npk: number;

    if (P_butuh === 0 && K_butuh === 0) {
      npkFase = 0; limiting = "-";
      N_dari_npk = P_dari_npk = K_dari_npk = 0;
    } else if (P_butuh === 0) {
      npkFase = npkDariK; limiting = "K";
      N_dari_npk = npkFase * (rasioN / 100);
      P_dari_npk = npkFase * (rasioP / 100);
      K_dari_npk = npkFase * (rasioK / 100);
    } else if (K_butuh === 0) {
      npkFase = npkDariP; limiting = "P";
      N_dari_npk = npkFase * (rasioN / 100);
      P_dari_npk = npkFase * (rasioP / 100);
      K_dari_npk = npkFase * (rasioK / 100);
    } else {
      if (npkDariP <= npkDariK) { npkFase = npkDariP; limiting = "P"; }
      else                       { npkFase = npkDariK; limiting = "K"; }
      N_dari_npk = npkFase * (rasioN / 100);
      P_dari_npk = npkFase * (rasioP / 100);
      K_dari_npk = npkFase * (rasioK / 100);
    }

    const sisaUrea = Math.max(0, N_butuh - N_dari_npk) / 0.46;
    const sisaSP36 = Math.max(0, P_butuh - P_dari_npk) / 0.36;
    const sisaKCl  = Math.max(0, K_butuh - K_dari_npk) / 0.60;

    return {
      fase: f.fase,
      limiting,
      npk:  r(npkFase  * luas),
      urea: r(sisaUrea * luas),
      sp36: r(sisaSP36 * luas),
      kcl:  r(sisaKCl  * luas),
    };
  });
}

// ── JADWAL: JAGUNG MAJEMUK ────────────────────────────────────

function jadwalJagungMajemuk(totalNPK: number, totalUrea: number): JadwalFaseMajemukJagung[] {
  const fases = [
    { fase: "7 HST",  pctNPK: 0.50, pctUrea: 0.50 },
    { fase: "28 HST", pctNPK: 0.30, pctUrea: 0.25 },
    { fase: "45 HST", pctNPK: 0.20, pctUrea: 0.25 },
  ];
  return fases.map((f) => ({
    fase: f.fase,
    npk:  r(totalNPK  * f.pctNPK),
    urea: r(totalUrea * f.pctUrea),
  }));
}

// ── JADWAL: JAGUNG TUNGGAL ────────────────────────────────────

function jadwalJagungTunggal(totalNPK: number, totalUrea: number): JadwalFaseTunggal[] {
  const fases = [
    { fase: "7 HST",  pctNPK: 0.50, pctUrea: 0.50 },
    { fase: "28 HST", pctNPK: 0.30, pctUrea: 0.25 },
    { fase: "45 HST", pctNPK: 0.20, pctUrea: 0.25 },
  ];
  return fases.map((f) => {
    const npkFase  = totalNPK  * f.pctNPK;
    const ureaFase = totalUrea * f.pctUrea;
    return {
      fase: f.fase,
      urea: r(ureaFase + (npkFase * 0.15) / 0.46),
      sp36: r((npkFase * 0.15) / 0.36),
      kcl:  r((npkFase * 0.15) / 0.60),
    };
  });
}

// ── MAIN RULE ENGINE ─────────────────────────────────────────

export function runRuleEngine(input: RuleEngineInput): RuleEngineOutput {
  const { N, P, K, EC, pH, varietas, luas, targetPanen, jenisPupuk, rasioNPK } = input;

  // Layer 1 — Warning
  const warnings = cekWarning(pH, EC);

  // Layer 2 — Target panen
  const { ureaPerHa, produktivitas } = ureaFromTarget(targetPanen);

  // Layer 3 — Dosis per ha
  const dosisPerHa =
    varietas === "padi"
      ? dosisPadi(P, K, ureaPerHa)
      : dosisJagung(P, K);

  // Rasio NPK
  let rasioN = 0, rasioP = 0, rasioK = 0;
  if (jenisPupuk === "majemuk") {
    if (rasioNPK === "15:12:10") { rasioN = 15; rasioP = 12; rasioK = 10; }
    else                         { rasioN = 15; rasioP = 15; rasioK = 15; } // default 15:15:15
  }

  // ── PADI TUNGGAL
  if (varietas === "padi" && jenisPupuk === "tunggal") {
    const totalUrea = r(dosisPerHa.urea * luas);
    const totalSP36 = r(dosisPerHa.sp36 * luas);
    const totalKCl  = r(dosisPerHa.kcl  * luas);
    return {
      warnings,
      targetPanen: { nilai: targetPanen, produktivitas, ureaPerHa },
      dosisPerHa,
      totalLahan: { urea: totalUrea, sp36: totalSP36, kcl: totalKCl },
      jadwal: jadwalPadiTunggal(totalUrea, totalSP36, totalKCl),
    };
  }

  // ── PADI MAJEMUK
  if (varietas === "padi" && jenisPupuk === "majemuk") {
    const maj = hitungMajemuk(dosisPerHa, rasioN, rasioP, rasioK);
    return {
      warnings,
      targetPanen: { nilai: targetPanen, produktivitas, ureaPerHa },
      dosisPerHa,
      majemuk: maj,
      totalLahan: {
        npk:  r(maj.npkMajemuk * luas),
        urea: r(maj.sisaUrea   * luas),
        sp36: r(maj.sisaSP36   * luas),
        kcl:  r(maj.sisaKCl    * luas),
      },
      jadwal: jadwalPadiMajemuk(dosisPerHa, rasioN, rasioP, rasioK, luas),
    };
  }

  // ── JAGUNG (tunggal & majemuk sama-sama perlu hitung NPK dulu)
  const majJagung   = hitungMajemuk(dosisPerHa, 15, 15, 15);
  const totalNPKHa  = majJagung.npkMajemuk;
  const totalUreaHa = dosisPerHa.urea;
  const totalNPKLahan  = r(totalNPKHa  * luas);
  const totalUreaLahan = r(totalUreaHa * luas);

  // ── JAGUNG TUNGGAL
  if (varietas === "jagung" && jenisPupuk === "tunggal") {
    return {
      warnings,
      targetPanen: { nilai: targetPanen, produktivitas, ureaPerHa },
      dosisPerHa,
      totalLahan: { npk: totalNPKLahan, urea: totalUreaLahan, sp36: 0, kcl: 0 },
      jadwal: jadwalJagungTunggal(totalNPKLahan, totalUreaLahan),
    };
  }

  // ── JAGUNG MAJEMUK
  return {
    warnings,
    targetPanen: { nilai: targetPanen, produktivitas, ureaPerHa },
    dosisPerHa,
    totalLahan: { npk: totalNPKLahan, urea: totalUreaLahan, sp36: 0, kcl: 0 },
    jadwal: jadwalJagungMajemuk(totalNPKLahan, totalUreaLahan),
  };
}

// ── HELPER: gabung sensor + form petani → RuleEngineInput ────

export function buildRuleEngineInput(
  sensorPayload: { n: number; p: number; k: number; ec: number; ph: number },
  farmerInput: FarmerInput
): RuleEngineInput {
  return {
    N:          sensorPayload.n,
    P:          sensorPayload.p,
    K:          sensorPayload.k,
    EC:         sensorPayload.ec,
    pH:         sensorPayload.ph,
    varietas:   farmerInput.tanamanDipilih,
    luas:       farmerInput.luasLahan,
    targetPanen: farmerInput.targetHasilPanen,
    jenisPupuk: farmerInput.jenisPupukDipilih,
    rasioNPK:   farmerInput.rasioNPKDipilih,
  };
}

// ── OUTPUT ──────────────────────────────────────────
//   const rekomendasiPupuk = getRekomendasi(payload.main, farmerInput);

export function getRekomendasi(
  sensorPayload: { n: number; p: number; k: number; ec: number; ph: number },
  farmerInput: FarmerInput
): RuleEngineOutput {
  const input = buildRuleEngineInput(sensorPayload, farmerInput);
  return runRuleEngine(input);
}
