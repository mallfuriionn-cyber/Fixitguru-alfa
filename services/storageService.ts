import { DatabaseSchema, TableName, User, SocialPost, Project, SavedManual, WorkshopReport, SavedConversation, CloudFile, SystemTask, AuditLog, UserRole, LegalDispute, PublicGuide, AgentId } from '../types.ts';
import { MOCK_SOCIAL_FEED, MOCK_PROJECTS, MOCK_CLOUD } from '../constants.tsx';

const DB_KEY = 'synthesis_core_db';

class StorageService {
  private data: DatabaseSchema;

  constructor() {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
      this.ensureTables();
    } else {
      this.initializeDefaultData();
    }
  }

  private ensureTables() {
    const tables: TableName[] = ['users', 'posts', 'projects', 'manuals', 'reports', 'conversations', 'cloudFiles', 'tasks', 'globalAudit', 'publicGuides'];
    tables.forEach(t => {
      if (!this.data[t]) (this.data[t] as any) = [];
    });
  }

  private initializeDefaultData() {
    const sampleDisputes: LegalDispute[] = [
      {
        id: 'disp-001',
        title: 'Reklamace: MacBook Air M2 (Vada klávesnice)',
        date: '15. 02. 2026',
        status: 'V řešení',
        attachments: [],
        chatTranscript: [{ role: 'model', text: '### Analýza vady klávesnice\nDle § 2161 NOZ musí mít věc při převzetí vlastnosti ujednané.', timestamp: new Date() }],
        extractedData: { opponentName: 'iStyle CZ', documentType: 'Reklamační protokol', productName: 'MacBook Air M2' }
      }
    ];

    const sampleManuals: SavedManual[] = [
      {
        id: 'man-vlastni-01',
        title: 'Návod na opravu: Kávovar DeLonghi Magnifica',
        brand: 'Vlastní',
        model: 'Magnifica S',
        category: 'Uživatelské postupy',
        originalText: 'Diagnóza: Netěsnost pístu spařovací jednotky.',
        translatedText: '### Postup opravy\n1. Otevření šasi\n2. Výměna O-kroužků\n3. Promazání silikonovou vazelínou',
        sourceUrl: 'Synthesis Workshop',
        dateAdded: '18. 02. 2026'
      }
    ];

    const samplePublicGuides: PublicGuide[] = [
      {
        id: 'pg-makita-lxt-v2',
        title: 'Inženýrská repase akumulátoru Makita 18V LXT',
        author: 'Mallfurion',
        authorAvatar: '✦',
        date: '2026-02-21',
        deviceName: 'Makita BL1830 / BL1850',
        rating: 5.0,
        diagnosis: 'BMS LOCK: Články podvybité pod 2.5V. Nutná dekonstrukce a bypass ochranného obvodu pro oživení.',
        procedure: `### I. POTŘEBNÉ VYBAVENÍ & KALIBRACE
*   **Sada bitů Security Torx T10:** Nutné s vnitřním otvorem pro bezpečnostní trn.
*   **Multimetr (přesnost ±0.01V):** Kalibrován pro low-voltage měření.
*   **Laboratorní zdroj:** Lineární regulace 0-20V, limitace proudu na 500mA pro bezpečné probuzení článků.
*   **IPA 99.9%:** Pro dekontaminaci kontaktů BMS.

### II. BEZPEČNOSTNÍ PROTOKOL LP-05
**KRITICKÉ VAROVÁNÍ:** Li-ion akumulátory mají vnitřní odpor blížící se nule. Zkrat terminálů B+ a B- vede k okamžitému tepelnému úniku (Thermal Runaway). Pracujte na nehořlavé podložce.

### III. DETAILNÍ POSTUP (REPASE JÁDRA)
1.  **Dekonstrukce šasi:** Vyšroubujte 4x T10 bity. Pozor na křehké plastové zámky indikačního LED panelu.
2.  **Měření segmentů (Balance Check):** Měřte napětí mezi terminály V1-V5. Maximální povolená odchylka (Delta) je 0.15V. Pokud je Delta > 0.5V, články jsou nevyvážené a BMS zablokuje nabíjení.
3.  **Bypass oživení (Trickle Charge):** Pokud je celkové napětí pod 15V, připojte laboratorní zdroj přímo na hlavní sběrnici článků. **LIMIT PROUDU:** Nastavte 300mA. Monitorujte teplotu článků IR teploměrem (nesmí překročit 45°C).
4.  **Soft-Reset BMS:** U čipů řady Atmel/Renesas v Makita BMS je po detekci chyby zapsán příznak do EEPROM. Pro reset použijte programátor skrze servisní piny (piny 1, 2, 4 na horním konektoru).
5.  **Validace kapacity:** Po nabití na 20.5V proveďte zkušební vybití přes 20A zátěžový odpor. Napětí nesmí klesnout pod 16V během prvních 10 minut.`,
        conclusion: 'Baterie obnovena na 100% kapacity. BMS resetována a kalibrována dle inženýrského standardu.',
        category: 'Akunářadí'
      },
      {
        id: 'pg-iphone13-bat',
        title: 'Výměna baterie iPhone 13 bez chybové hlášky',
        author: 'FixitPro_CZ',
        authorAvatar: '📱',
        date: '2026-02-15',
        deviceName: 'iPhone 13 / 13 Pro',
        rating: 4.8,
        diagnosis: 'Kapacita pod 80%. Nutná transplantace původního BMS čipu na nové články pro zachování funkce "Kondice baterie".',
        procedure: `### I. POTŘEBNÉ NÁŘADÍ & ESD SETUP
*   **Pentalobe P2 & Tri-point Y000:** Inženýrské šroubováky s magnetickou fixací.
*   **Horkovzdušná stanice:** Nastavení na přesných 80°C (Proud vzduchu 3/10).
*   **Nová "Tag-on" flex:** Pro komunikaci s programátorem JCID.
*   **Spot Welder (Bodová svářečka):** Ruční bodovka pro Li-ion spoje.

### II. FÁZE 1: CHIRURGICKÁ DEMONTÁŽ DISPLEJE
1. Nahřejte displej na separátoru (80°C/120s). 
2. Použijte isopropanol k rozpuštění originálního těsnění. **POZOR:** Displej se vyklápí o 90 stupňů doprava. Nepřekračujte úhel, hrozí poškození datové sběrnice FaceID.
3. Odpojte konektor baterie. Změřte odpor proti zemi na deskách - musí být > 100k ohm.

### III. FÁZE 2: TRANSPLANTACE BMS (CHIP SWAP)
1. Odizolujte původní baterii. Odstřihněte niklové pásky co nejblíže u článků.
2. Přibodujte (Spot Weld) piny původního BMS na nové články. **NIKDY nepájejte cínem přímo na baterii!** Teplo zničí vnitřní separátory.
3. Připojte programátor. Proveďte "Cycle Count Reset" na hodnotu 0 a nastavte "Health Percentage" na 100%.

### IV. FÁZE 3: ZPĚTNÁ MONTÁŽ & TESNĚNÍ
1. Naneste nové originální těsnění (Pre-cut adhesive).
2. Spusťte kalibrační sezení (0-100% nabití) v režimu "Diagnostic Boot".`,
        conclusion: 'Baterie ukazuje 100% kondici v nastavení iOS. Chybová hláška o neoriginálním dílu potlačena neuronovým bypassem.',
        category: 'Mobilní telefony'
      },
      {
        id: 'pg-kaercher-mot',
        title: 'Kompletní repase motoru Kärcher WD série',
        author: 'ElectroMaster',
        authorAvatar: '⚡',
        date: '2026-02-05',
        deviceName: 'Kärcher WD 3 / WD 6',
        rating: 4.2,
        diagnosis: 'Silné jiskření, úbytek tahu a specifický pach ozónu (spáleniny). Pravděpodobná smrt uhlíků nebo komutátoru.',
        procedure: `### I. DIAGNOSTIKA ROTORU & STATORU
1.  **Rozborka:** Odstraňte kryt motoru (Torx T20). Vyjměte turbínu (pozor, matice má opačný závit - povolovat doprava!).
2.  **Kontrola uhlíků:** Pokud je délka pod 5mm, přítlačná pružina ztrácí lineární tlak (Hookeův zákon), což vede k jiskření a vypalování lamel.
3.  **Revize komutátoru:** Pokud jsou lamely černé (oxidované), použijte brusný kámen nebo houbu zrnitosti 1500. Lamely nesmí mít hloubkovou erozi nad 0.1mm.

### II. VÝMĚNA LOŽISEK (INTEGRITY CHECK)
1. Použijte dvouramenný stahovák. Odstraňte ložiska 608-2RS.
2. Očistěte hřídel rotoru technickým benzínem. Zkontrolujte házivost hřídele úchylkoměrem (max 0.02mm).
3. Nalisujte nová ložiska SKF Explorer. Použijte trubkový narážeč působící pouze na vnitřní kroužek ložiska.

### III. MONTÁŽ & ZÁBĚH (BREAK-IN)
1. Vložte nové uhlíky s vysokým obsahem grafitu.
2. Před zapojením 230V zatočte rotorem ručně - musí se volně otáčet bez drhnutí.
3. **ZÁBĚHOVÝ PROTOKL:** Zapněte motor na 80V (přes autotransformátor) po dobu 10 minut. Poté postupně zvyšujte na 230V. Tím dojde k dokonalému vytvarování styčné plochy uhlíků.`,
        conclusion: 'Motor běží s tichým chodem, jiskření komutátoru eliminováno o 98%. Tah obnoven na nominální hodnotu.',
        category: 'Domácí spotřebiče'
      },
      {
        id: 'pg-moun-carb',
        title: 'Seřízení karburátoru Briggs & Stratton (Metoda Precision)',
        author: 'Zahradnik_Jirka',
        authorAvatar: '🚜',
        date: '2026-02-10',
        deviceName: 'Mountfield / Briggs & Stratton 625 Series',
        rating: 4.5,
        diagnosis: 'Motor "houpe" (kolísají otáčky), zhasíná při přechodu do zátěže.',
        procedure: `### I. ULTRAZVUKOVÉ ČIŠTĚNÍ
1. Kompletní demontáž karburátoru. Vyjměte plovák a jehlový ventil.
2. **KRITICKÝ BOD:** Vyšroubujte hlavní trysku a emulzní trubici. Pokud zůstanou uvnitř, ultrazvuk nevyčistí vnitřní kanály bohatosti směsi.
3. Čistěte v 20% roztoku Tickopur při 60°C po dobu 25 minut.

### II. SEŘÍZENÍ SMĚSI (AIR/FUEL RATIO)
1. Zašroubujte šroub bohatosti (L) jemně nadoraz. Pak povolte o přesně 1.5 otáčky.
2. Nastartujte motor a nechte jej běžet 5 minut v režimu "Turtle" (nízké otáčky).
3. Otáčejte šroubem (L) doleva (obohacování), dokud otáčky nezačnou klesat, pak doprava, dokud nezačnou opět klesat. Nastavte šroub přesně doprostřed tohoto rozsahu.

### III. KONTROLA REGULÁTORU (GOVERNOR)
Zkontrolujte pružinky regulátoru. Pokud mají viditelnou únavu materiálu, motor bude kolísat i při čistém karburátoru. Vyměňte za originální sadu 691859/692211.`,
        conclusion: 'Motor startuje na první zatáhnutí za studena i za tepla. Chod je stabilní bez kolísání otáček.',
        category: 'Zahrada'
      }
    ];

    const architect: User = {
      id: 'u-mallfurion',
      secretId: 'SID-MALLFURION-ROOT',
      virtualHash: 'HASH-ARCHITECT-001',
      hardwareId: 'HW-STATION-MASTER-01',
      email: 'sarji@seznam.cz',
      username: 'mallfurion',
      name: 'Jiří "Mallfurion" Šár',
      role: UserRole.ARCHITECT,
      level: 999,
      avatar: '✦',
      registrationDate: '01. 01. 2026',
      lastLogin: new Date().toLocaleString(),
      mandateAccepted: true,
      privacyDelay: false,
      disputes: sampleDisputes,
      assets: [],
      stats: { repairs: 542, growing: 120, success: '100%', publishedPosts: 48 },
      equipment: ['Synthesis Core Prime', 'Logic Analyzer', 'Páječka JBC'],
      security: {
        method: 'PASSKEY_HARDWARE',
        level: 'Maximální',
        hardwareHandshake: true,
        biometricStatus: 'ACTIVE',
        lastAuthAt: new Date().toISOString(),
        encryptionType: 'AES-256-GCM',
        integrityScore: 100
      }
    };

    this.data = {
      users: [architect],
      posts: MOCK_SOCIAL_FEED,
      projects: MOCK_PROJECTS,
      manuals: sampleManuals,
      reports: [],
      conversations: [],
      cloudFiles: MOCK_CLOUD,
      tasks: [{ id: 't1', type: 'CORE_READY', status: 'COMPLETED', createdAt: new Date().toLocaleString() }],
      globalAudit: [{ id: 'a1', timestamp: new Date().toLocaleString(), action: 'CORE_INITIALIZATION', actorId: 'SYSTEM', actorName: 'Synthesis Core', category: 'SYSTEM', severity: 'LOW' }],
      publicGuides: samplePublicGuides
    };
    this.save();
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    window.dispatchEvent(new CustomEvent('db-update', { detail: this.data }));
  }

  public getAll<T extends TableName>(table: T): DatabaseSchema[T] {
    return this.data[table] || [];
  }

  public getById<T extends TableName>(table: T, id: string): any {
    return (this.data[table] as any[] || []).find((item: any) => item.id === id);
  }

  public insert<T extends TableName>(table: T, item: any) {
    if (!this.data[table]) (this.data[table] as any) = [];
    (this.data[table] as any[]).unshift(item);
    this.save();
    return item;
  }

  public update<T extends TableName>(table: T, id: string, updates: any) {
    const tableData = this.data[table] as any[] || [];
    const index = tableData.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      tableData[index] = { ...tableData[index], ...updates };
      this.save();
      return tableData[index];
    }
    return null;
  }

  public delete<T extends TableName>(table: T, id: string) {
    this.data[table] = (this.data[table] as any[] || []).filter((item: any) => item.id !== id) as any;
    this.save();
  }

  public reset() {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
}

export const db = new StorageService();