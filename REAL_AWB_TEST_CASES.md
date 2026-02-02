# 🔍 Real AWB Test Numbers

Use these actual AWB tracking numbers from the imported dataset:

## ✅ On-Time Shipments (Green Status)
- **883775720669** - Mumbai → Manila (FedEx Priority IP)
- **887326699596** - Mumbai → Bangkok (On-time delivery)
- **390472104211** - New Delhi → Hanoi (Priority IP)
- **473243480827** - Delhi → Ho Chi Minh City (Priority)
- **887658482360** - Mumbai → Bangkok (Priority IP)

## 🟡 In Transit / Processing
- **396278020856** - Bangalore → Hanoi (Transit-Processing)
- **393737526359** - Jaipur → Bangkok (Clearance)
- **397591339020** - Chennai → Jakarta (Clearance)
- **887957911694** - Bangalore → Bangkok (Transit-Processing)

## 🔴 Delayed / Exception Cases
- **882464153434** - Ahmedabad → Bangkok (EWDL - Delayed)
- **883490980396** - Kolkata → Manila (EWDL - Customs delay)
- **393192894760** - Mumbai → Bangkok (EWDL - Route error)
- **444909190882** - Delhi → Ho Chi Minh City (EWDL - Late scan)
- **393129954127** - Bhavnagar → Ho Chi Minh City (Exception)
- **885259231437** - Chennai → Hanoi (Dest delay)
- **883277708884** - New Delhi → Hanoi (EWDL - Late delivery)

## 🌏 Various Routes

### India → Thailand
- **473243480827** - Delhi → Ho Chi Minh City
- **883461148671** - Bangalore → Bangkok
- **392433388811** - Mumbai → Bangkok
- **888048544659** - New Delhi → Bangkok

### India → Vietnam
- **390472104211** - New Delhi → Hanoi
- **444909196273** - Delhi → Haiphong
- **473243474545** - Delhi → Ho Chi Minh City
- **473243504872** - Delhi → Ho Chi Minh City

### India → Philippines
- **883775720669** - Mumbai → Manila
- **883490980396** - Kolkata → Manila
- **884471908221** - Bangalore → Cebu

### India → Indonesia
- **883100454105** - Hyderabad → Batam
- **887835587301** - Ahmedabad → Jakarta
- **884622089412** - Chennai → Cikarang
- **396381010740** - Chennai → Batam

## 📊 Test Scenarios

### Scenario 1: High Priority Medical Supplies
**AWB:** 883775720669  
Route: Mumbai → Manila  
Service: FedEx Intl Priority  
Status: On-Time ✅

### Scenario 2: Customs Hold / Exception
**AWB:** 882464153434  
Route: Ahmedabad → Bangkok  
Service: Priority IP  
Status: Exception 🔴  
Issue: Customs hold, routing error

### Scenario 3: Transit Processing
**AWB:** 396278020856  
Route: Bangalore → Hanoi  
Service: Priority IP  
Status: Transit-Processing 🟡  
Location: Currently in China hub

### Scenario 4: Late Delivery
**AWB:** 885259231437  
Route: Chennai → Hanoi  
Service: Priority IP  
Status: Delayed 🔴  
Issue: Destination delay

## 🧪 How to Test

1. Go to **Search AWB** in the navigation
2. Enter any AWB number from above
3. Click Search or press Enter
4. View shipment details, route, scans, and status

## 📈 Data Coverage

- **Total AWBs:** 57,237 real shipments
- **Services:** Priority (47,009), Deferred (9,780), TNT (448)
- **Regions:** AMEA (Asia-Middle East-Africa)
- **Status Distribution:**
  - ✅ On-Time: 34,800 (60.7%)
  - 🔴 EWDL (Delayed): 12,094 (21.1%)
  - 🟡 WDL (Warning): 10,069 (17.6%)

## 💡 Pro Tips

- Try searching for AWBs starting with `88` - Most recent shipments
- Search `39` prefix - Various priority shipments
- Search `47` prefix - International economy
- Look for AWBs with `pof_cause` in database for exception cases

---

**Data Source:** IN SPAC NSL.txt (57K+ real FedEx shipment records)  
**Last Updated:** February 2, 2026
