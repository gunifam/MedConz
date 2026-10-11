import { cryptoFor, espeesFor, formatNgn, pricing } from "../lib/payments/pricing";

let fails = 0;
const check = (name: string, cond: boolean) => {
  console.log((cond ? "PASS " : "FAIL ") + name);
  if (!cond) fails++;
};

// PRD example: 4,100 NGN shows as 2 Espees at 1 = 2,050
check("espees example", espeesFor(4100, 2050) === "2");
check("espees fractional", espeesFor(1000, 2050) === "0.4878");
check("crypto math", cryptoFor(4100, 100_000_000, 8) === "0.000041");
check("crypto rounds up", Number(cryptoFor(4100, 100_000_000, 8)) * 100_000_000 >= 4100);
check("ngn format", formatNgn(4100) === "4,100");
check("defaults", pricing.consultNgn() === 4100 && pricing.espeesRate() === 2050);
check("ttl", pricing.cryptoTtlMinutes() === 15);
check("cryptos", pricing.cryptos().join(",") === "BTC,ETH,USDT");
check("followup window", pricing.followupFreeHours() === 72);

if (fails > 0) {
  console.error(fails + " FAILURES");
  process.exit(1);
}
console.log("ALL PHASE-6 UNIT CHECKS GREEN");
