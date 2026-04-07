# election-69-OCR-result

Official 2026 Thai election results from the Election Commission of Thailand (กกต.), OCR-extracted from official Form สส.6/1 PDF announcements and structured as machine-readable JSON.

ผลคะแนนเลือกตั้ง 2569 อย่างเป็นทางการ แปลงจากแบบ สส.6/1 ที่ กกต. เผยแพร่เป็น PDF ให้อยู่ในรูปแบบ JSON

---

## ⚠️ Disclaimer

This dataset is produced through OCR processing with multi-model cross-validation using multiple AI vision models, OCR engines, and LLMs to ensure accuracy before publishing. We do not alter, modify, or manipulate any election data in any way.

This is an independent volunteer civic effort to help digitize official election results published by the Election Commission of Thailand (กกต.), which we believe may lack sufficient resources to do so at scale. All processing costs are self-funded by the author personally — this project has no affiliation with any business, political party, or civic organization whatsoever.

For official and authoritative results, please always refer to the original documents from กกต.

## ⚠️ ข้อสงวนสิทธิ์

ข้อมูลชุดนี้ถูกสร้างจากการอ่าน OCR โดยผ่านการตรวจสอบความถูกต้องข้ามระบบ (cross-validation) ด้วย AI vision models, OCR engines และ LLMs หลายตัว เพื่อความแม่นยำก่อนเผยแพร่ เราไม่มีส่วนเกี่ยวข้องในการแก้ไข ดัดแปลง หรือบิดเบือนข้อมูลผลการเลือกตั้งใดๆ ทั้งสิ้น

โครงการนี้จัดทำขึ้นโดยสมัครใจเพื่อช่วย กกต. ในการ digitize ผลการเลือกตั้งที่เผยแพร่อย่างเป็นทางการ ซึ่งเราเชื่อว่า กกต. อาจมีทรัพยากรไม่เพียงพอในการดำเนินการด้วยตนเอง ค่าใช้จ่ายในการประมวลผลทั้งหมดเป็นทุนส่วนตัวของผู้จัดทำ — โครงการนี้ไม่มีความเกี่ยวข้องกับธุรกิจ พรรคการเมือง หรือองค์กรภาคประชาสังคมใดๆ ทั้งสิ้น

สำหรับผลการเลือกตั้งที่เป็นทางการ กรุณาอ้างอิงจากเอกสารต้นฉบับของ กกต. เสมอ

## ⚠️ PDF Source Quality Issues / ปัญหาคุณภาพไฟล์ต้นทาง

PDF จาก กกต. ทั้ง 776 ไฟล์เป็น **scanned images** (สแกนจากเครื่อง Canon) **ไม่ใช่ digital PDF** — ไม่มี text layer ต้อง OCR ทั้งหมด ทำให้เกิดข้อผิดพลาดจากหลายจุด:

| จุดที่เกิดข้อผิดพลาด | ตัวอย่าง |
|---|---|
| **การกรอกต้นฉบับ** | ลายมือไม่ชัด, ตัวเลขอ่านยาก, กรอกผิดช่อง |
| **การพิมพ์** | ตัดขอบ, เอียง, หมึกจาง |
| **การสแกน** | resolution ต่ำ, เงา, พับ, สกปรก |
| **การตั้งชื่อไฟล์** | กกต. อัพโหลด PDF ผิดเขต (เช่น ลพบุรี เขต 4 เป็นเอกสารเขต 1) |

**สรุป:** Scanned PDF ≠ Digital data — ไม่สามารถใช้แทนฐานข้อมูลดิจิทัลได้จริง หากต้องการข้อมูลที่เชื่อถือได้ 100% ต้องสร้าง PDF จากระบบโดยตรง (digitally generated) ไม่ใช่สแกนกระดาษเข้าระบบ คุณภาพข้อมูลจะผิดพลาดได้ทุกขั้นตอน ตั้งแต่ต้นทางการกรอก → การพิมพ์ → การสแกน → การตั้งชื่อไฟล์

---

## 📊 Data Coverage / ความครอบคลุมของข้อมูล

ประมวลผลจาก **776 PDF scans** (แบบ สส.6/1 สแกนจากเครื่อง Canon ไม่มี text layer) จาก กกต. → AI Vision OCR → structured JSON **794 matched files** (397 สส.เขต + 397 บัญชีรายชื่อ)

|  | สส.เขต (Constituency) | บัญชีรายชื่อ (Party List) |
|---|---|---|
| **เขตที่นำเข้าแล้ว** | 397 / 400 (99.25%) | 397 / 400 (99.25%) |
| **Vote sum match (dd=0)** | 384 / 397 (96.7%) | 341 / 397 (85.9%) |
| **Duplicate candidates** | 0 | N/A |

### ตัวเลขสำคัญ — Final Result

|  | สส.เขต (Constituency) | บัญชีรายชื่อ (Party List) |
|---|---|---|
| **คะแนนรวม (total votes)** | 34,579,802 | 34,758,153 |
| **ผู้มีสิทธิเลือกตั้ง (eligible voters)** | 52,524,541 | 52,579,202 |

> คำนวณจาก 397/400 เขต (สส.เขต) และ 397/400 เขต (บัญชีรายชื่อ) — ยังขาดข้อมูล 3 เขต

### แบบบัญชีรายชื่อ (Party List) — Top 5

| พรรค | คะแนน |
|------|-------|
| ประชาชน | 10,861,542 |
| ภูมิใจไทย | 6,396,439 |
| เพื่อไทย | 5,482,572 |
| ประชาธิปัตย์ | 3,861,415 |
| เศรษฐกิจ | 1,129,354 |
| **รวมทุกพรรค (397 เขต)** | **34,758,153** |

---

## 📂 Data Structure / โครงสร้างข้อมูล

```
data/
├── csv/                            # CSV รวม — เปิดได้ด้วย Excel / Google Sheets
│   ├── constituency.csv            # ผลแบบแบ่งเขต ทุกผู้สมัคร (3,458 rows)
│   ├── party_list.csv              # ผลแบบบัญชีรายชื่อ ทุกพรรค (22,635 rows)
│   └── summary_winners.csv        # สรุปผู้ชนะแบบแบ่งเขต (397 rows)
├── matched/                        # JSON ที่ผ่าน validation + matched กับฐานข้อมูลผู้สมัคร
│   ├── constituency/               # แบบแบ่งเขต (397 files)
│   ├── party_list/                 # แบบบัญชีรายชื่อ (397 files)
│   ├── issues.json                 # รายการปัญหาที่พบ
│   └── validation_report.json      # สรุปผลการตรวจสอบ
└── ocr-output/                     # JSON ดิบจาก OCR
    ├── constituency/               # แบบแบ่งเขต (397 files)
    └── party_list/                 # แบบบัญชีรายชื่อ (397 files)
```

### CSV Files (สำหรับเปิดด้วย Excel / Google Sheets)

| ไฟล์ | คำอธิบาย | คอลัมน์ |
|------|----------|---------|
| `constituency.csv` | ผลคะแนนแบบแบ่งเขต ทุกผู้สมัคร | รหัสจังหวัด, จังหวัด, เขต, หมายเลข, ชื่อผู้สมัคร, พรรค, คะแนน |
| `party_list.csv` | ผลคะแนนแบบบัญชีรายชื่อ ทุกพรรค | รหัสจังหวัด, จังหวัด, เขต, หมายเลข, พรรค, คะแนน |
| `summary_winners.csv` | สรุปผู้ชนะแบบแบ่งเขต | รหัสจังหวัด, จังหวัด, เขต, ผู้ชนะ, พรรค, คะแนน, คะแนนดี, ผู้มีสิทธิ, มาใช้สิทธิ |

### Matched JSON (แนะนำสำหรับนักพัฒนา)

ข้อมูลที่ผ่านการ validate และ match กับฐานข้อมูลผู้สมัครแล้ว มีข้อมูลเพิ่มเติม:

- `province_code` — รหัสจังหวัด
- `summary` — สรุปภาพรวม (eligible_voters, good_votes, invalid_votes, ฯลฯ)
- `matched_candidates` — ผู้สมัครที่ match ได้พร้อม `candidate_uuid`
- `unmatched_candidates` — ผู้สมัครที่ match ไม่ได้
- `issues.json` — รายการปัญหาที่พบระหว่าง validation
- `validation_report.json` — สรุปผลการตรวจสอบทั้งหมด

### Raw OCR JSON (ข้อมูลดิบ)

- **ocr-output/constituency/** — ผลคะแนนแบบแบ่งเขตเลือกตั้ง (397 files)
- **ocr-output/party_list/** — ผลคะแนนแบบบัญชีรายชื่อ (397 files)

---

## 🔍 Quality Assurance / การตรวจสอบคุณภาพ

### 1. แก้เลขหมายผู้สมัคร สส.เขต

**ปัญหา:** OCR engine อ่านเลขหมายผู้สมัครผิด/สลับ **616 จุด** ใน **194 เขต** (จาก 387 เขต)

**วิธีแก้:** ใช้ `candidate_uuid` (ที่ match ด้วยชื่อถูกแล้ว) lookup เลขหมายที่ถูกต้องจากฐานข้อมูล

**ผลลัพธ์:** ผู้สมัคร 3,458 คน ทั้ง 397 เขต — เลขหมายตรงกับฐานข้อมูล **100%**

### 2. แก้เลขหมายพรรค บัญชีรายชื่อ

**ปัญหา:** OCR engine สร้าง phantom entries (พรรคเปล่า 0 คะแนน) ทำให้เลขหมายพรรคเลื่อน ผิด **3,184 จุด** ใน **94 เขต** (จาก 386 เขต)

**วิธีแก้:** ใช้ `party_uuid` lookup เลขหมายพรรคที่ถูกต้องจาก `election_parties` ในฐานข้อมูล

**ผลลัพธ์:** 57 พรรค × 397 เขต — เลขหมายตรงกับฐานข้อมูล **100%**

### 3. แก้คะแนนบัญชีรายชื่อ — 15 เขตที่ vote sum ไม่ตรง

แก้ไขทั้งหมดแล้ว → **0 mismatches**

| ประเภทปัญหา | จำนวน | ตัวอย่าง |
|-------------|-------|----------|
| Phantom/hallucinated entries | 10 areas | OCR engine แทรก "Unknown Party" เปล่าๆ ดันพรรคจริงหลุด |
| Missing parties | 7 areas | พรรคหายไปเพราะ phantom เข้ามาแทนที่ เช่น ใหม่, รวมใจไทย, ไทยทรัพย์ทวี |
| Thai numeral misreads | 3 areas | ๖→๕, ๐↔๒ transposition, ๘→๔ |

> แก้โดยเทียบกับ PDF ต้นฉบับทีละเขต

### 4. แก้เลขผู้สมัครซ้ำ สส.เขต — 45 เขต

แก้ไขทั้งหมดแล้ว → **0 duplicates**

- OCR engine อ่านเลขหมายผู้สมัครผิด/สลับ/ซ้ำกัน
- แก้โดย query ข้อมูลจริง 476 คนจาก Reporter DB แล้ว match ด้วยชื่อพรรค

### 5. Re-OCR ไฟล์ที่คะแนนยังไม่ตรง

**ปัญหา:** หลังแก้ phantom entries แล้ว ยังมีบัญชีรายชื่อ 54 เขตที่ vote sum ไม่ตรง (dd≠0) เกิดจากคุณภาพ PDF สแกนต่ำ

**วิธีแก้:**
- **AI Model 1** — re-OCR 48 ไฟล์ แล้ว match ด้วยชื่อพรรค (name-based matching)
- **AI Model 2** — re-OCR 6 ไฟล์ที่ยากที่สุด (Model 1 อ่านไม่ได้)

**ผลลัพธ์:** dd≠0 ลดจาก 54 → 7 เขต

### 6. ลบ Phantom Duplicates จาก OCR

**ปัญหา:** OCR engine สร้างพรรคปลอม (phantom entries) — พรรคที่มีชื่อซ้ำกับพรรคจริงแต่คะแนนต่างกัน ทำให้มีพรรคเกินจำนวนจริง

**วิธีแก้:** ตรวจจับและลบ phantom duplicates ออก คงไว้เฉพาะ entry ที่ match กับฐานข้อมูล

### 7. ตรวจสอบ results vs matched data ทุกไฟล์

**บัญชีรายชื่อ:** สแกน 385 ไฟล์ เทียบ results (raw OCR) กับ matched_parties (verified data) — พบ 69 ไฟล์ไม่ตรง

| ปัญหา | ไฟล์ | วิธีแก้ |
|---|---|---|
| match ผิดพรรค (พลังชาติ→พลังไทยรักชาติ) | 30_10 | แก้เป็น code 7 = พลวัต |
| votes ต่างกัน (249→149) | 62_1 | sync เป็น 149 (DD=0) |
| ชื่อพรรคผิด (ก้าวอิสระ→ปวงชนไทย) | 90_5 | sync ตาม matched |
| ชื่อผิด (พลัง→พร้อม) | 36_4 | sync ตาม matched |
| rebuild results จาก matched | 95 ไฟล์ | ชื่อ/เลข/votes ตรงหมด |

**ผลลัพธ์:** 384/385 ไฟล์ results == matched_parties (30_13 มี 55/57 พรรค — PDF อ่านไม่ออก)

**สส.เขต:** สแกน 387 ไฟล์ → 386/387 ตรง — 14_2 (อยุธยา 2) มี 8 phantom entries ว่างเปล่า → ลบแล้ว

### 8. Verify กับ Reporter DB

เทียบ 3,458 ผู้สมัคร สส.เขตกับ DB → UUID ตรง 100%, เลขหมายตรง 100%

### ตัวเลขสรุป

|  | สส.เขต | บัญชีรายชื่อ |
|---|---|---|
| **เลขหมายผิด** | 0 | 0 |
| **Vote sum match (dd=0)** | 384 / 397 (96.7%) | 341 / 397 (85.9%) |
| **Duplicate candidates** | 0 | N/A |

### Remaining Known Issues

- **13 เขต สส.เขต dd≠0** — เป็นข้อจำกัดของ OCR จาก PDF สแกนคุณภาพต่ำ
- **56 เขต บัญชีรายชื่อ dd≠0** — เป็นข้อจำกัดของ OCR จาก PDF สแกนคุณภาพต่ำ
- **35 unmatched party entries** — phantom/blank entries (0 votes) ไม่กระทบตัวเลขรวม
- **2 unmatched candidates** — ถูกถอนชื่อ/ชื่อไม่ตรง DB

---

## 🚫 Missing Areas / เขตที่ยังไม่มีข้อมูล

### สส.เขต (Constituency) — ขาด 3 เขต

| # | จังหวัด | เขต | หมายเหตุ |
|---|---------|------|----------|
| 1 | กรุงเทพมหานคร | 15 | กกต. ยังไม่ประกาศ |
| 2 | ปราจีนบุรี | 2 | |
| 3 | น่าน | 1 | มีเฉพาะบัญชีรายชื่อ |

### บัญชีรายชื่อ (Party List) — ขาด 3 เขต

| # | จังหวัด | เขต | หมายเหตุ |
|---|---------|------|----------|
| 1 | กรุงเทพมหานคร | 15 | กกต. ยังไม่ประกาศ |
| 2 | ปราจีนบุรี | 2 | |
| 3 | อุดรธานี | 6 | มีเฉพาะ สส.เขต |

---

## 📅 Timeline

| วันที่ | เหตุการณ์ |
|-------|----------|
| 2026-02-08 (8 ก.พ. 69) | วันเลือกตั้ง สส. 2569 |
| 2026-02-20 (20 ก.พ. 69) | กกต. ประกาศผลการนับคะแนนอย่างเป็นทางการ 100% เป็น PDF (776 ไฟล์) ยกเว้น 3 เขต |
| 2026-02-20 (20 ก.พ. 69) | เริ่มประมวลผล OCR จาก 776 PDF scans |
| 2026-02-21 (21 ก.พ. 69) | นำเข้าข้อมูล matched: สส.เขต 387/400, บัญชีรายชื่อ 386/400 |
| 2026-02-21 (21 ก.พ. 69) | แก้ไข 15 OCR errors บัญชีรายชื่อ (phantom entries, missing parties, digit misreads) — vote sum mismatch = 0 |
| 2026-02-21 (21 ก.พ. 69) | แก้ไขเลขผู้สมัครซ้ำ 45 เขต สส.เขต — duplicate candidates = 0 |
| 2026-02-21 (21 ก.พ. 69) | แก้เลขหมายผู้สมัคร สส.เขต 616 จุด (194 เขต) — lookup จาก candidate_uuid → เลขหมายตรง 100% |
| 2026-02-21 (21 ก.พ. 69) | แก้เลขหมายพรรค บัญชีรายชื่อ 3,184 จุด (94 เขต) — lookup จาก party_uuid → เลขหมายตรง 100% |
| 2026-02-22 (22 ก.พ. 69) | Re-OCR บัญชีรายชื่อ 54 ไฟล์ด้วย AI Model 2 ตัว — dd≠0 ลดจาก 54 → 7 เขต |
| 2026-02-22 (22 ก.พ. 69) | ลบ phantom duplicates + ลบ ลพบุรี เขต 4 (กกต. อัพโหลด PDF ผิด) — party list 386 → 385 files |
| 2026-02-23 (23 ก.พ. 69) | ตรวจสอบ results vs matched ทุกไฟล์ — แก้ 4 ปัญหา + rebuild 95 ไฟล์ party list |
| 2026-02-23 (23 ก.พ. 69) | ลบ phantom entries สส.เขต 14_2 (อยุธยา 2) + verify 3,372 ผู้สมัครกับ DB → ตรง 100% |
| 2026-02-25 (25 ก.พ. 69) | เพิ่มบุรีรัมย์ 10 เขต (สส.เขต + บัญชีรายชื่อ), ลพบุรี 16_4, นครพนม 48_2 — coverage 397/400 (99.25%) |

> Timeline จะอัปเดตเมื่อ กกต. ประกาศผลเพิ่มเติม หรือเมื่อข้อมูลได้รับการแก้ไข

---

## 📌 Attribution / การอ้างอิง

If you use this dataset, please credit:

**ชานนท์ เงินทองดี (Chanon Ngernthongdee)**

or link back to this repository: [election-69-OCR-result](https://github.com/killernay/election-69-OCR-result)

หากนำข้อมูลชุดนี้ไปใช้ กรุณาให้เครดิต **นายชานนท์ เงินทองดี** หรืออ้างอิงกลับมาที่ repository นี้

---

## 🐛 Found an Error? / พบข้อผิดพลาด?

If you find any inaccuracies in the data, please report via:

**Twitter/X:** [@killernay](https://x.com/killernay)

หากพบข้อผิดพลาดในข้อมูล สามารถแจ้งได้ที่ [@killernay](https://x.com/killernay) บน Twitter/X — หากว่างจะรีบตรวจสอบและแก้ไขทันที

---

## 📄 Data Source / แหล่งข้อมูลต้นฉบับ

- แบบ สส.6/1 จากสำนักงานคณะกรรมการการเลือกตั้ง (กกต.)
- [https://www.ect.go.th](https://www.ect.go.th)

![ประกาศ กกต.](assets/ect-announcement.jpeg)

## 🛠️ Processing Pipeline

```
776 PDF scans (กกต. — Canon copier, no text layer)
    │
    ▼
┌──────────────────┐     ┌──────────────────────┐
│  AI Vision OCR   │     │  ฐานข้อมูลอ้างอิง      │
│  + LLM           │     │  - Reporter DB        │
│                  │     │  - election_parties   │
└────────┬─────────┘     └───────────┬──────────┘
         │                           │
         ▼                           │
┌──────────────────┐                 │
│  Validate + Match │◄────────────────┘
│  Vote sum check   │
│  Candidate UUIDs  │
│  Party UUIDs      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Fix OCR Errors                  │
│  1. เลขหมายผู้สมัคร (616 จุด)     │
│  2. เลขหมายพรรค (3,184 จุด)      │
│  3. คะแนนบัญชีรายชื่อ (15 เขต)    │
│  4. เลขผู้สมัครซ้ำ (45 เขต)       │
│  5. Re-OCR (AI Model 1 + 2)     │
│  6. ลบ phantom duplicates       │
└────────┬─────────────────────────┘
         │
         ▼
   JSON + CSV output
   (raw + matched)
```

1. **Source** — 776 PDF scans (แบบ สส.6/1) จาก กกต. สแกนจากเครื่อง Canon ไม่มี text layer ต้อง OCR ทั้งหมด
2. **OCR** — AI Vision OCR เป็นหลัก + cross-validation กับ OCR engine และ LLM อื่นๆ
3. **Validate + Match** — ตรวจ vote sums, match province codes + candidate/party UUIDs, เทียบกับ Reporter DB และ election_parties
4. **Fix OCR Errors** — แก้เลขหมายผู้สมัคร 616 จุด (194 เขต) + เลขหมายพรรค 3,184 จุด (94 เขต) + คะแนนบัญชีรายชื่อ 15 เขต + เลขผู้สมัครซ้ำ 45 เขต
5. **Re-OCR** — AI Model 1 (48 files) + AI Model 2 (6 files) สำหรับไฟล์ที่คะแนนยังไม่ตรง → dd≠0 ลดจาก 54 → 7
6. **Cleanup** — ลบ phantom duplicates จาก OCR + ลบไฟล์ที่ กกต. อัพโหลดผิด
7. **Output** — JSON (raw 794 files + matched 794 files) และ CSV

## 📜 License

This data is derived from publicly available official government documents. The structured JSON output is provided freely for public use. Please attribute as noted above.
