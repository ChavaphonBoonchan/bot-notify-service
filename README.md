# Discord Website Status Bot

บอท Discord สำหรับติดตามสถานะของเว็บไซต์และแสดงผลในรูปแบบ Embed ที่จะอัปเดตข้อมูลแทนการส่งข้อความใหม่

## ฟีเจอร์

- 🔍 ติดตามสถานะเว็บไซต์หลายๆ เว็บพร้อมกัน
- 📊 แสดงผลในรูปแบบ Embed ที่สวยงาม
- ✏️ อัปเดตข้อความเดิมแทนการส่งใหม่
- ⏱️ แสดง response time ของแต่ละเว็บไซต์
- 🎨 เปลี่ยนสีตามสถานะ (เขียว=ปกติ, ส้ม=บางส่วนล่ม, แดง=ล่มหมด)
- 🤖 คำสั่งสำหรับเช็คสถานะด้วยตัวเอง

## การติดตั้ง

1. **Clone หรือ Download โปรเจกต์**

2. **ติดตั้ง Dependencies**
   ```cmd
   npm install
   ```

3. **สร้าง Discord Bot**
   - ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
   - สร้าง Application ใหม่
   - ไปที่แท็บ "Bot" และสร้าง Bot
   - คัดลอก Token

4. **ตั้งค่า Bot Permissions**
   - Bot ต้องมีสิทธิ์:
     - Send Messages
     - Use Slash Commands
     - Embed Links
     - Read Message History
     - Use External Emojis

5. **เชิญ Bot เข้า Server**
   - สร้าง Invite Link ในแท็บ "OAuth2" -> "URL Generator"
   - เลือก "bot" scope และสิทธิ์ที่จำเป็น

6. **ตั้งค่าไฟล์ Environment**
   ```cmd
   copy .env.example .env
   ```
   
   แก้ไขไฟล์ `.env`:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CHANNEL_ID=your_channel_id_here
   WEBSITES=https://google.com,https://github.com,https://your-website.com
   CHECK_INTERVAL=300000
   ```

## การใช้งาน

1. **เริ่มรันบอท**
   ```cmd
   npm start
   ```
   
   หรือสำหรับการพัฒนา:
   ```cmd
   npm run dev
   ```

2. **คำสั่งใน Discord**
   - `!status` - เช็คสถานะทันที
   - `!reset` - รีเซ็ตข้อความสถานะ (Admin เท่านั้น)

## การตั้งค่า

### ไฟล์ .env

- `DISCORD_TOKEN`: Token ของบอท Discord
- `CHANNEL_ID`: ID ของแชนเนลที่จะส่งข้อความสถานะ
- `WEBSITES`: URL ของเว็บไซต์ที่จะติดตาม (คั่นด้วยคอมม่า)
- `CHECK_INTERVAL`: ระยะเวลาในการเช็ค (มิลลิวินาที, ค่าเริ่มต้น 5 นาที)

### การหา Channel ID

1. เปิด Developer Mode ใน Discord (Settings -> Advanced -> Developer Mode)
2. คลิกขวาที่แชนเนล -> Copy ID

## ตัวอย่างผลลัพธ์

บอทจะแสดง Embed ที่มี:
- สถานะรวม (จำนวนเว็บที่ออนไลน์/ทั้งหมด)
- สถานะของแต่ละเว็บไซต์
- Response Time
- HTTP Status Code
- เวลาที่เช็คล่าสุด

## การพัฒนาต่อ

- เพิ่มการแจ้งเตือนเมื่อเว็บล่ม
- เพิ่มการบันทึกประวัติ
- เพิ่ม Slash Commands
- เพิ่มการตั้งค่าผ่าน Discord

## License

MIT
