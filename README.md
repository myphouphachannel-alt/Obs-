# OBS PRO REMOTE 🎬📱

เว็บไซต์ควบคุม **OBS Studio** บนคอมพิวเตอร์ Windows ผ่านสมาร์ตโฟน ออกแบบมาเป็นพิเศษสำหรับ **iPhone (เปิดผ่าน Safari)** และอุปกรณ์แท็บเล็ต/เดสก์ท็อป โดยไม่ต้องติดตั้งแอปพลิเคชันเพิ่มเติม

---

## 🚀 คุณสมบัติหลัก (Key Features)

1. **เชื่อมต่อกับ OBS Studio จริง** ผ่าน OBS WebSocket Protocol 5.x (`obs-websocket-js`)
2. **ระบบ Scene Switcher:** แสดงรายชื่อ Scene จริง ดึงภาพตัวอย่าง (Snapshot Thumbnail) ด้วย `GetSourceScreenshot` พร้อมระบบ Studio Mode (Preview / Program / Transition)
3. **ระบบ Source Control:** เปิด/ปิดการมองเห็นเลเยอร์ (Visibility ON/OFF) แยกตาม Scene
4. **Audio Mixer:** มิกเซอร์เสียงสด ปรับระดับเสียงด้วย Fader แสดงหน่วย dB และเปอร์เซ็นต์ พร้อมปุ่ม MUTE/UNMUTE
5. **Camera Switcher Pads:** แป้นสลับกล้องด่วนขนาดใหญ่ (CAM 1 - CAM 6) สำหรับงานถ่ายทอดสดฟุตบอล อีเวนต์ และการประชุม ปรับแต่งการจับคู่ Scene ได้อย่างอิสระ
6. **Video & Media Control:** ควบคุมคลิปวิดีโอ Replay, Stinger, เพลง (Play, Pause, Restart, Stop)
7. **Broadcast Live & Record Control:** สั่ง Start/Stop Streaming และ Recording พร้อมแสดงเวลา Timecode, ปริมาณข้อมูล และระบบล็อคนิรภัย (Safety Lock) ป้องกันการกดพลาด
8. **ระบบความปลอดภัย:** ไม่บันทึกรหัสผ่านลง LocalStorage และไม่มีการส่งข้อมูลออกนอกเครือข่าย

---

## 🛠️ วิธีติดตั้งและเริ่มต้นใช้งาน (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันเซิร์ฟเวอร์สำหรับใช้งานภายในบ้าน/สำนักงาน (LAN)
```bash
npm run dev
```
*(ระบบจะเปิดพอร์ต 3000 ให้บริการ เช่น `http://0.0.0.0:3000`)*

---

## 🖥️ วิธีตั้งค่า OBS Studio บน Windows

1. เปิดโปรแกรม **OBS Studio** (เวอร์ชัน 28.0 ขึ้นไป มี WebSocket v5 ในตัว)
2. ไปที่เมนูด้านบน: **Tools (เครื่องมือ)** &gt; **WebSocket Server Settings (การตั้งค่าเซิร์ฟเวอร์ WebSocket)**
3. ทำเครื่องหมายถูกที่ **"Enable WebSocket server" (เปิดใช้งานเซิร์ฟเวอร์ WebSocket)**
4. ตรวจสอบพอร์ตเซิร์ฟเวอร์: **`4455`**
5. **รหัสผ่าน (Authentication):**
   - สามารถกด *Generate Password* เพื่อตั้งรหัสผ่าน หรือ
   - สำหรับใช้งานภายในบ้าน/วง Wi-Fi ส่วนตัว สามารถนำเครื่องหมายถูกออกจาก *Enable Authentication* ชั่วคราวได้
6. กด **Apply** และ **OK**

---

## 🔍 วิธีตรวจสอบ IP Address ของคอมพิวเตอร์ Windows

1. กดปุ่ม `Windows + R` บนคีย์บอร์ด พิมพ์ `cmd` แล้วกด Enter
2. พิมพ์คำสั่ง:
   ```cmd
   ipconfig
   ```
3. เลื่อนดูที่อะแดปเตอร์ Wi-Fi หรือ Ethernet มองหา **IPv4 Address** เช่น:
   ```text
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   ```
   *(นำหมายเลข IP นี้ไปเปิดบน Safari ของ iPhone)*

---

## 📱 วิธีเชื่อมต่อ iPhone Safari กับคอมพิวเตอร์

1. เชื่อมต่อ iPhone เข้ากับ **Wi-Fi วงเดียวกับคอมพิวเตอร์**
2. เปิดเบราว์เซอร์ **Safari** บน iPhone
3. พิมพ์ URL:
   ```text
   http://192.168.1.105:3000
   ```
   *(เปลี่ยน `192.168.1.105` เป็น IP จริงของคอมพิวเตอร์คุณ)*
4. ในหน้า **Connection** ใส่:
   - IP: `192.168.1.105`
   - Port: `4455`
   - Password: รหัสผ่านจาก OBS (ถ้ามี)
5. กด **Connect** เพื่อเริ่มควบคุม OBS ทันที!

> 💡 **เทคนิคเปิดเต็มจอเหมือน Native App บน iPhone:**  
> ใน Safari กดปุ่ม **แชร์ (Share)** ด้านล่าง แล้วเลือก **"Add to Home Screen" (เพิ่มไปยังหน้าจอโฮม)** จะได้ไอคอนแอปที่เปิดแบบ Fullscreen ไม่มีแถบ URL รบกวน

---

## 🛡️ ข้อมูลด้านความปลอดภัย & วิธีแก้ปัญหา (Troubleshooting)

### 1. ทำไมเชื่อมต่อไม่ได้ (Connection Refused / Timeout)
- **Windows Firewall:** ตรวจสอบว่า Windows Defender Firewall อนุญาตให้ OBS Studio รับการเชื่อมต่อผ่าน Private Network หรือเพิ่ม Inbound Rule สำหรับ TCP พอร์ต `4455`
- **Wi-Fi AP Isolation:** ตรวจสอบว่าเราเตอร์ไม่ได้เปิดโหมด *Guest Wi-Fi* หรือ *Client Isolation* ซึ่งจะป้องกันไม่ให้อุปกรณ์ในวงแลนคุยกันได้

### 2. ข้อจำกัด Mixed Content บน Safari
- หากเปิดเว็บผ่าน **HTTPS** (เช่น Cloud Preview) เบราว์เซอร์ Safari จะบล็อกการเชื่อมต่อไปยัง WebSocket แบบ `ws://` (ไม่เข้ารหัส)
- **วิธีแก้:** เปิดเว็บไซต์ผ่าน **`http://`** ภายในวง LAN (เช่น `http://192.168.1.105:3000`) บน Safari จะเชื่อมต่อ WebSocket `ws://` ได้ทันทีอย่างราบรื่น

---

## 📦 วิธี Build และ Deploy สำหรับ Production

```bash
# คอมไพล์และสร้างโค้ดสำหรับ Production
npm run build

# ทดสอบรันไฟล์ที่ build แล้ว
npm run preview
```
