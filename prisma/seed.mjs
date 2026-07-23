// CrossBorder Marketplace — synthetic demo seed (Phase 3).
// Idempotent: wipes previously-seeded demo data (emails ending @demo.crossborder or the
// ops account) then rebuilds. Run: npm run db:seed
//
// Coverage goals (every scenario represented):
//  ~100 users: 50 buyers, 46 travelers, 3 BOTH, 1 OPS
//  - fresh signups with zero activity (both sides)
//  - travelers with upcoming / active / completed trips, with full flight details
//  - buyers with OPEN requests (some with no offers yet), detailed purchase specs +
//    where-to-buy (online URL or offline store), quantity, delivery address
//  - PROPOSED matches awaiting the buyer, one DECLINED match
//  - orders at EVERY lifecycle stage incl. delivery partner/fee/OTP where relevant
//  - CONFIRMED+RELEASED orders with mutual ratings + review comments (landing testimonials)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO = "@demo.crossborder";
const PASSWORD = "demo1234";

// ---- reference data (mirrors lib/geo.ts + lib/partners.ts; plain JS here) ----
const AP = {
  JFK: { city: "New York", country: "USA" }, SFO: { city: "San Francisco", country: "USA" },
  LHR: { city: "London", country: "UK" }, CDG: { city: "Paris", country: "France" },
  FRA: { city: "Frankfurt", country: "Germany" }, AMS: { city: "Amsterdam", country: "Netherlands" },
  DXB: { city: "Dubai", country: "UAE" }, SIN: { city: "Singapore", country: "Singapore" },
  NRT: { city: "Tokyo", country: "Japan" }, ICN: { city: "Seoul", country: "South Korea" },
  SYD: { city: "Sydney", country: "Australia" }, BLR: { city: "Bengaluru", country: "India" },
  BOM: { city: "Mumbai", country: "India" }, DEL: { city: "Delhi", country: "India" },
  GRU: { city: "São Paulo", country: "Brazil" }, YYZ: { city: "Toronto", country: "Canada" },
};
const IATAS = Object.keys(AP);

const FIRST = ["Ananya","Diego","Hana","Liam","Priya","Mateus","Yuki","Emma","Arjun","Sofia","Kenji","Olivia","Rahul","Camila","Minjun","Charlotte","Vikram","Isabella","Takeshi","Amelia","Rohan","Valentina","Jisoo","Grace","Aditya","Beatriz","Haruto","Mia","Karthik","Luiza","Seojun","Chloe","Nikhil","Fernanda","Ren","Zara","Sanjay","Gabriela","Daichi","Ella","Ishaan","Mariana","Sota","Ruby","Dev","Larissa","Kaito","Ivy","Aarav","Julia","Farhan","Elena","Marco","Aisha","Lucas","Noor","Felix","Leila","Omar","Nina","Pedro","Sana","Hugo","Tara","Ali","Maya","Jonas","Rhea","Ethan","Anika","Noah","Divya","Oscar","Kavya","Louis","Meera","Adam","Pooja","Ryan","Sneha","Jack","Nisha","Leo","Asha","Max","Riya","Tom","Gita","Ben","Lila","Sam","Neha","Dan","Uma","Joe","Veda","Kim","Wren","Raj","Yara"];
const LAST = ["Rao","Martins","Sato","O'Connor","Sharma","Silva","Tanaka","Clarke","Mehta","Rossi","Yamamoto","Bennett","Iyer","Costa","Park","Wright","Nair","Moretti","Kobayashi","Hughes","Gupta","Almeida","Kim","Walker","Verma","Souza","Watanabe","Brooks","Reddy","Oliveira","Choi","Turner","Joshi","Lima","Ito","Foster","Patel","Santos","Nakamura","Bailey","Kapoor","Ribeiro","Suzuki","Morgan","Malhotra","Ferreira","Takahashi","Bell","Agarwal","Pereira"];

// city -> a plausible street address
const ADDR = {
  "New York": "148 W 24th St, Apt 6B, New York, NY 10011",
  "San Francisco": "2130 Fillmore St, San Francisco, CA 94115",
  "London": "44 Cloth Fair, Barbican, London EC1A 7JQ",
  "Paris": "17 Rue des Martyrs, 75009 Paris",
  "Frankfurt": "Schweizer Str. 42, 60594 Frankfurt am Main",
  "Amsterdam": "Prinsengracht 263, 1016 GV Amsterdam",
  "Dubai": "Marina Gate 2, Apt 1204, Dubai Marina",
  "Singapore": "71 Tiong Bahru Rd, #05-11, Singapore 168732",
  "Tokyo": "2-11-3 Meguro, Meguro-ku, Tokyo 153-0063",
  "Seoul": "45 Hannam-daero, Yongsan-gu, Seoul 04417",
  "Sydney": "12 Foveaux St, Surry Hills NSW 2010",
  "Bengaluru": "221, 6th Cross, Indiranagar 2nd Stage, Bengaluru 560038",
  "Mumbai": "B-704 Marine Crest, Worli Sea Face, Mumbai 400030",
  "Delhi": "C-52 Defence Colony, New Delhi 110024",
  "São Paulo": "Rua Oscar Freire 725, Ap 82, Jardins, São Paulo",
  "Toronto": "38 Grenville St, Unit 2011, Toronto, ON M4Y 1A5",
};

// Detailed product catalog: [title, category, spec/notes, purchaseAt, originIata, priceMajor, rewardMajor, localMajor, currency, qty]
const CATALOG = [
  ["MacBook Pro 14\" M4 Pro", "Electronics", "Space Black, 24GB RAM / 1TB SSD. Sealed box only, US keyboard layout.", "Offline — Apple Store, Fifth Avenue, New York (open 24/7)", "JFK", 1999, 120, 2560, "USD", 1],
  ["Sony A7 IV body", "Cameras", "Body only, latest firmware. Ask for extra NP-FZ100 battery if under $80.", "Online — bhphotovideo.com (ships to hotel) or B&H store 420 9th Ave NYC", "JFK", 2498, 150, 3120, "USD", 1],
  ["iPhone 16 Pro 256GB", "Electronics", "Natural Titanium, factory unlocked, US model. Verify IMEI before leaving store.", "Offline — Apple Store, SoHo, New York", "JFK", 1099, 90, 1420, "USD", 1],
  ["Dyson Airwrap Complete Long", "Beauty", "Nickel/Copper, UK plug is fine (I have adapters). Gift wrap not needed.", "Offline — Boots, Oxford Street, London", "LHR", 480, 45, 640, "GBP", 1],
  ["Nike Air Jordan 4 'Bred' UK9", "Sneakers", "UK size 9 (US 10). Must be from Nike/JD, keep receipt for authenticity.", "Offline — JD Sports, Oxford Street London or online nike.com/gb", "LHR", 210, 30, 320, "GBP", 1],
  ["La Mer Crème 100ml duo", "Cosmetics", "2 × 100ml Crème de la Mer from duty free — sealed, batch date this year.", "Offline — Heathrow T5 World Duty Free (landside not valid)", "LHR", 690, 55, 940, "GBP", 2],
  ["Louis Vuitton Neverfull MM", "Fashion", "Monogram canvas, beige interior. Ask for date-code photo before purchase.", "Offline — LV Maison, Champs-Élysées, Paris", "CDG", 1760, 130, 2350, "EUR", 1],
  ["Rimowa Original Cabin", "Luggage", "Silver aluminium cabin size. Register warranty at store in my name (email in notes).", "Offline — Rimowa Store, Neue Mainzer Str., Frankfurt", "FRA", 1200, 85, 1580, "EUR", 1],
  ["Gouda aged 36 months, 2kg wheel", "Food", "Vacuum-sealed for customs, keep under 2kg total. Reypenaer VSOP preferred.", "Offline — Reypenaer Tasting Room, Singel 182, Amsterdam", "AMS", 95, 20, 160, "EUR", 1],
  ["Gold 24K coin 10g (Dubai rate)", "Jewellery", "10g 999.9 coin with certificate. Must be sealed assay card. Invoice needed for customs.", "Offline — Damas, Dubai Mall (Gold Souk rate)", "DXB", 720, 60, 890, "USD", 1],
  ["Sony WH-1000XM6", "Electronics", "Black. Singapore set has 2-pin adapter — include it.", "Online — shopee.sg (Sony official) or Sony Store, Orchard", "SIN", 420, 35, 540, "SGD", 1],
  ["Nintendo Switch 2 + Mario Kart", "Gaming", "Japan region console is fine, need English menu proof. Bundle if cheaper.", "Offline — Bic Camera, Yurakucho, Tokyo (tax-free counter, bring passport)", "NRT", 449, 45, 620, "USD", 1],
  ["Shiseido Ultimune 100ml ×3", "Cosmetics", "3 sealed boxes, airport duty-free batch. Check expiry > 18 months.", "Offline — Narita T1 duty free (ANA side)", "NRT", 330, 30, 480, "USD", 3],
  ["Gentle Monster 'Her' sunglasses", "Fashion", "Black frame, latest collection. Include cleaning kit they give free.", "Offline — Gentle Monster flagship, Apgujeong, Seoul", "ICN", 260, 25, 380, "USD", 1],
  ["UGG Classic Ultra Mini W8", "Fashion", "Chestnut, women's US 8. Australian-made label version only.", "Offline — UGG Sydney flagship, Pitt Street Mall", "SYD", 199, 25, 310, "AUD", 1],
  ["Vitamin D3+K2 (Thorne) ×4", "Health", "4 bottles, sealed, expiry 2027+. Keep pharmacy receipt.", "Online — iherb.com ship-to-locker NYC, or GNC Times Square", "JFK", 130, 18, 220, "USD", 4],
  ["Lego Star Wars UCS Falcon", "Toys", "75192, sealed box. Box corners matter — bubble wrap please.", "Online — lego.com/en-us (pickup 5th Ave store)", "JFK", 850, 80, 1150, "USD", 1],
  ["Kindle Scribe 64GB + pen", "Electronics", "2nd gen, premium pen. US Amazon exclusive colour.", "Online — amazon.com (deliver to your hotel)", "SFO", 420, 35, 560, "USD", 1],
  ["Levi's 501 Original ×3", "Fashion", "W32 L32, Stonewash + Black + Indigo. Outlet pricing.", "Offline — Levi's Outlet, Livermore, San Francisco Bay", "SFO", 180, 22, 310, "USD", 3],
  ["Scotch — Macallan 12 Double Cask", "Spirits", "2 bottles from duty free, within my country's 2L allowance. Boxed.", "Offline — Heathrow T2 World Duty Free", "LHR", 170, 25, 260, "GBP", 2],
  ["Zara wool overcoat (EU M)", "Fashion", "Camel, EU size M, this season. If sold out, Massimo Dutti equivalent OK (msg me).", "Offline — Zara, Passeig de Gràcia line — CDG airport branch OK", "CDG", 189, 20, 290, "EUR", 1],
  ["Samsung 990 Pro 4TB ×2", "Electronics", "2 sealed drives, heatsink version. Check hologram seal.", "Online — newegg.com or Micro Center Brooklyn", "JFK", 640, 50, 880, "USD", 2],
  ["Tim Tams + Vegemite care pack", "Food", "10 packs Tim Tam assorted + 2 Vegemite 380g. Coles bag is fine.", "Offline — Coles, World Square Sydney", "SYD", 85, 15, 150, "AUD", 1],
  ["Havaianas assorted ×6 pairs", "Fashion", "Sizes 37-38 ×3, 41-42 ×3, classic Brasil colours.", "Offline — Havaianas flagship, Rua Oscar Freire, São Paulo", "GRU", 120, 18, 210, "USD", 6],
  ["Canada Goose Chilliwack M", "Fashion", "Black, men's M, fusion fit. Verify hologram + register warranty.", "Offline — Canada Goose, Yorkdale Mall, Toronto", "YYZ", 1150, 95, 1520, "CAD", 1],
  ["iPad Pro 13\" M4 WiFi 512GB", "Electronics", "Silver, with Apple Pencil Pro. Tax-free counter with passport.", "Offline — Bic Camera Shibuya (tax-free) or Apple Marunouchi", "NRT", 1499, 110, 1890, "USD", 1],
  ["COSRX + Beauty of Joseon set", "Cosmetics", "Full K-beauty list attached in notes: snail 96, retinol eye, ginseng cream ×2 each.", "Offline — Olive Young flagship, Myeongdong, Seoul", "ICN", 140, 20, 260, "USD", 1],
  ["Xbox Series X (US spec)", "Gaming", "Disc version, sealed, US warranty card.", "Online — bestbuy.com pickup Union Square NYC", "JFK", 499, 45, 680, "USD", 1],
  ["Chanel No.5 EDP 100ml ×2", "Cosmetics", "Duty-free sealed, gift ribbon on one.", "Offline — CDG T2E duty free, Paris", "CDG", 290, 28, 420, "EUR", 2],
  ["Herman Miller Sayl (boxed)", "Furniture", "Black, fully adjustable arms. Only if traveler has checked-baggage allowance 30kg+.", "Online — hermanmiller.com/en_us outlet", "SFO", 690, 90, 1050, "USD", 1],
];

// review comments for CONFIRMED orders → landing testimonials
const REVIEWS = [
  { forTraveler: "Flawless. Kept every receipt, sent photos from the store, and my MacBook arrived sealed. Saved me a fortune.", forBuyer: "Crystal-clear instructions and instant escrow deposit. Dream buyer." },
  { forTraveler: "She grabbed the last Airwrap at Boots and even got the duty-free receipt stamped. Superstar.", forBuyer: "Quick to confirm delivery and lovely to deal with." },
  { forTraveler: "OTP handoff at my door in Indiranagar took 30 seconds. Camera was bubble-wrapped like a museum piece.", forBuyer: "Paid the moment we matched. Zero fuss." },
  { forTraveler: "Flight landed 9am, CrossBorder courier reached me by 6pm the same day. Unreal.", forBuyer: "Great communication throughout." },
  { forTraveler: "Bought exactly the spec I asked — 24GB/1TB, Space Black. The savings paid for my whole weekend.", forBuyer: "Punctual at the hub handoff. Would carry for again." },
  { forTraveler: "Sneakers authenticated with the JD receipt, size perfect. Earned a fan for life.", forBuyer: "Clear address, easy OTP, five stars." },
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const minor = (major) => Math.round(major * 100);
const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

// deterministic-ish name generator (index-based, no collisions)
function personName(i) {
  return `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / 2) % LAST.length]}`;
}
function emailFor(name, i) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${i}${DEMO}`;
}

const FLIGHTS = [
  ["Air India", "AI 102", "Boeing 777-300ER", "JFK", "DEL"],
  ["British Airways", "BA 275", "Airbus A380", "LHR", "BLR"],
  ["Emirates", "EK 202", "Airbus A380", "DXB", "JFK"],
  ["Singapore Airlines", "SQ 317", "Airbus A380", "SIN", "LHR"],
  ["Qatar Airways", "QR 8", "Boeing 777-300ER", "LHR", "DEL"],
  ["United", "UA 48", "Boeing 787-9", "SFO", "BLR"],
  ["Lufthansa", "LH 754", "Boeing 747-8", "FRA", "BLR"],
  ["Air France", "AF 225", "Boeing 777-300ER", "CDG", "BOM"],
  ["Japan Airlines", "JL 4", "Boeing 777-300ER", "NRT", "JFK"],
  ["Korean Air", "KE 81", "Boeing 747-8", "ICN", "JFK"],
  ["Qantas", "QF 1", "Airbus A380", "SYD", "LHR"],
  ["LATAM", "LA 8084", "Boeing 787-9", "GRU", "JFK"],
  ["Air Canada", "AC 856", "Boeing 777-300ER", "YYZ", "LHR"],
  ["KLM", "KL 871", "Boeing 787-10", "AMS", "BLR"],
  ["Emirates", "EK 500", "Airbus A380", "DXB", "BOM"],
  ["ANA", "NH 827", "Boeing 787-9", "NRT", "SIN"],
  ["Vistara", "UK 27", "Boeing 787-9", "DEL", "LHR"],
  ["Cathay Pacific", "CX 881", "Boeing 777-300ER", "SFO", "SIN"],
];

// partner fee map (mirrors lib/partners.ts)
const PARTNER_FEE = {
  "BlueDart Express": 34900, "Dunzo Local": 19900, "FedEx Local": 129900, "UPS Ground": 109900,
  "DHL eCommerce": 99900, "Lalamove": 89900, "Sendle": 79900, "Loggi": 49900,
};
function partnerFor(country) {
  if (country === "India") return "Dunzo Local";
  if (country === "USA") return "FedEx Local";
  if (country === "Canada") return "FedEx Local";
  if (country === "Australia") return "Sendle";
  if (country === "Brazil") return "Loggi";
  if (["Singapore", "UAE", "Japan", "South Korea"].includes(country)) return "Lalamove";
  return "DHL eCommerce";
}
const FEE_PCT = 0.05;
const fee = (p, r) => Math.round((p + r) * FEE_PCT);

async function main() {
  console.log("Seeding CrossBorder demo data…");
  const hash = await bcrypt.hash(PASSWORD, 10);
  const opsHash = await bcrypt.hash("ops12345", 10);

  // ---- wipe previous demo rows (order matters for FKs) ----
  const demoUsers = await prisma.user.findMany({ where: { OR: [{ email: { endsWith: DEMO } }, { email: "ops@crossborder.local" }] }, select: { id: true } });
  const ids = demoUsers.map(u => u.id);
  if (ids.length) {
    await prisma.rating.deleteMany({ where: { OR: [{ raterId: { in: ids } }, { rateeId: { in: ids } }] } });
    await prisma.message.deleteMany({ where: { senderId: { in: ids } } });
    await prisma.order.deleteMany({ where: { OR: [{ buyerId: { in: ids } }, { travelerId: { in: ids } }] } });
    await prisma.match.deleteMany({ where: { OR: [{ request: { buyerId: { in: ids } } }, { trip: { travelerId: { in: ids } } }] } });
    await prisma.request.deleteMany({ where: { buyerId: { in: ids } } });
    await prisma.trip.deleteMany({ where: { travelerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    console.log(`  wiped ${ids.length} previous demo users + their data`);
  }

  // ---- users: 50 buyers (idx 0-49), 46 travelers (50-95), 3 BOTH (96-98), 1 OPS ----
  const buyers = [], travelers = [], both = [];
  for (let i = 0; i < 99; i++) {
    const name = personName(i);
    const iata = IATAS[i % IATAS.length];
    const role = i < 50 ? "BUYER" : i < 96 ? "TRAVELER" : "BOTH";
    const u = await prisma.user.create({
      data: {
        email: emailFor(name, i), passwordHash: hash, fullName: name, role,
        homeCountry: AP[iata].country,
        kycStatus: i % 3 === 0 ? "VERIFIED" : i % 3 === 1 ? "PENDING" : "UNVERIFIED",
      },
    });
    (role === "BUYER" ? buyers : role === "TRAVELER" ? travelers : both).push({ ...u, iata });
  }
  const ops = await prisma.user.create({
    data: { email: "ops@crossborder.local", passwordHash: opsHash, fullName: "CrossBorder Ops", role: "OPS", kycStatus: "VERIFIED", homeCountry: "Singapore" },
  });
  console.log(`  users: ${buyers.length} buyers, ${travelers.length} travelers, ${both.length} both, 1 ops`);

  // ---- trips: ~36 (travelers 0-35 get one each; statuses spread) ----
  // status mix: 24 upcoming, 6 active, 6 completed. Fresh travelers (36-45) have none.
  const trips = [];
  for (let i = 0; i < 36; i++) {
    const t = travelers[i];
    const f = FLIGHTS[i % FLIGHTS.length];
    const status = i < 24 ? "UPCOMING" : i < 30 ? "ACTIVE" : "COMPLETED";
    const depDay = status === "UPCOMING" ? 3 + (i % 20) : status === "ACTIVE" ? -1 : -20 + (i % 10);
    const trip = await prisma.trip.create({
      data: {
        travelerId: t.id,
        fromCountry: AP[f[3]].country, toCountry: AP[f[4]].country,
        departDate: daysFromNow(depDay), arriveDate: daysFromNow(depDay + 1),
        luggageCapacityKg: 5 + (i % 5) * 3,
        airline: f[0], flightNumber: f[1], aircraft: f[2],
        departAirport: f[3], arriveAirport: f[4],
        status,
      },
    });
    trips.push({ ...trip, traveler: t });
  }
  console.log(`  trips: ${trips.length} (24 upcoming / 6 active / 6 completed)`);

  // ---- requests: every buyer 0-39 posts one from the catalog; buyers 40-49 stay fresh.
  // destination = buyer's home city; origin from catalog. Some (30-39) stay OPEN with no offers.
  const requests = [];
  for (let i = 0; i < 40; i++) {
    const b = buyers[i];
    const c = CATALOG[i % CATALOG.length];
    const destCity = AP[b.iata].city;
    const req = await prisma.request.create({
      data: {
        buyerId: b.id,
        title: c[0], category: c[1],
        notes: c[2],
        purchaseAt: c[3],
        productUrl: c[3].startsWith("Online") ? `https://${c[3].match(/[a-z0-9.-]+\.(com|sg|io)/)?.[0] ?? "example.com"}` : null,
        originCountry: AP[c[4]].country,
        destinationCountry: AP[b.iata].country,
        productPrice: minor(c[5]), travelerReward: minor(c[6]), localPrice: minor(c[7]),
        currency: c[8], quantity: c[9],
        deliveryCity: destCity, deliveryAddress: ADDR[destCity],
        status: "OPEN",
      },
    });
    requests.push({ ...req, buyer: b });
  }
  console.log(`  requests: ${requests.length} detailed (10 buyers left fresh)`);

  // ---- matches & orders across the lifecycle ----
  // requests[0..8] -> orders at 9 stages; [9,10] PROPOSED; [11] DECLINED; rest OPEN.
  const STAGES = [
    { status: "CREATED", escrow: "AWAITING_DEPOSIT" },
    { status: "CREATED", escrow: "HELD" },
    { status: "PURCHASED", escrow: "HELD" },
    { status: "IN_TRANSIT", escrow: "HELD" },
    { status: "LANDED", escrow: "HELD" },
    { status: "AT_HUB", escrow: "HELD" },
    { status: "OUT_FOR_DELIVERY", escrow: "HELD" },
    { status: "DELIVERED", escrow: "HELD" },
    { status: "CONFIRMED", escrow: "RELEASED" },
  ];
  // 3 extra CONFIRMED orders for more testimonials (requests 12,13,14)
  const orderPlans = [
    ...STAGES.map((s, i) => ({ reqIdx: i, tripIdx: i, ...s })),
    { reqIdx: 12, tripIdx: 9, status: "CONFIRMED", escrow: "RELEASED" },
    { reqIdx: 13, tripIdx: 10, status: "CONFIRMED", escrow: "RELEASED" },
    { reqIdx: 14, tripIdx: 11, status: "CONFIRMED", escrow: "RELEASED" },
  ];

  let ratingsMade = 0;
  for (let k = 0; k < orderPlans.length; k++) {
    const plan = orderPlans[k];
    const req = requests[plan.reqIdx];
    const trip = trips[plan.tripIdx];
    const match = await prisma.match.create({
      data: { requestId: req.id, tripId: trip.id, status: "ACCEPTED" },
    });
    await prisma.request.update({ where: { id: req.id }, data: { status: plan.status === "CONFIRMED" ? "FULFILLED" : "MATCHED" } });

    const destCountry = req.destinationCountry;
    const partner = partnerFor(destCountry);
    const dFee = PARTNER_FEE[partner];
    const pFee = fee(req.productPrice, req.travelerReward);
    const total = req.productPrice + req.travelerReward + pFee + dFee;
    const past = ["OUT_FOR_DELIVERY", "DELIVERED", "CONFIRMED"].includes(plan.status);
    const atHubOrLater = ["AT_HUB", "OUT_FOR_DELIVERY", "DELIVERED", "CONFIRMED"].includes(plan.status);

    const order = await prisma.order.create({
      data: {
        matchId: match.id, buyerId: req.buyerId, travelerId: trip.travelerId,
        productPrice: req.productPrice, travelerReward: req.travelerReward,
        platformFee: pFee, deliveryFee: atHubOrLater || plan.status !== "CREATED" ? dFee : dFee,
        totalAmount: total, currency: req.currency,
        escrowStatus: plan.escrow, status: plan.status,
        deliveryOtp: past ? String(100000 + ((k * 7919) % 900000)) : null,
        deliveryPartner: past ? partner : null,
        deliveryTrackingCode: past ? `CB-SEED${String(k).padStart(2, "0")}` : null,
        deliveryCity: req.deliveryCity, deliveryAddress: req.deliveryAddress,
      },
    });

    // mutual ratings + reviews on CONFIRMED orders
    if (plan.status === "CONFIRMED") {
      const rv = REVIEWS[ratingsMade % REVIEWS.length];
      await prisma.rating.create({ data: { orderId: order.id, raterId: req.buyerId, rateeId: trip.travelerId, stars: 5, comment: rv.forTraveler } });
      await prisma.rating.create({ data: { orderId: order.id, raterId: trip.travelerId, rateeId: req.buyerId, stars: ratingsMade % 2 === 0 ? 5 : 4, comment: rv.forBuyer } });
      ratingsMade += 2;
      // roll up ratee aggregates
      for (const uid of [trip.travelerId, req.buyerId]) {
        const agg = await prisma.rating.aggregate({ where: { rateeId: uid }, _avg: { stars: true }, _count: true });
        await prisma.user.update({ where: { id: uid }, data: { ratingAvg: agg._avg.stars ?? 0, ratingCount: agg._count } });
      }
    }
  }

  // PROPOSED matches awaiting buyer decision (requests 9,10 ← trips 12,13)
  await prisma.match.create({ data: { requestId: requests[9].id, tripId: trips[12].id, status: "PROPOSED" } });
  await prisma.match.create({ data: { requestId: requests[10].id, tripId: trips[13].id, status: "PROPOSED" } });
  // one DECLINED (request 11 ← trip 14) — request stays OPEN
  await prisma.match.create({ data: { requestId: requests[11].id, tripId: trips[14].id, status: "DECLINED" } });

  const counts = {
    users: await prisma.user.count(), trips: await prisma.trip.count(),
    requests: await prisma.request.count(), matches: await prisma.match.count(),
    orders: await prisma.order.count(), ratings: await prisma.rating.count(),
  };
  console.log("  done:", counts);
  console.log(`  demo password: ${PASSWORD} · ops: ops@crossborder.local / ops12345`);
  console.log(`  handy buyer: ${buyers[8].email} (order OUT_FOR_DELIVERY w/ OTP)`);
  console.log(`  handy traveler: ${travelers[0].email}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
