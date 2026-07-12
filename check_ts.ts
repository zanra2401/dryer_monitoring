const url2 = "https://api.thingspeak.com/channels/3425238/feeds.json?results=5";

async function check() {
    console.log("\nChecking Channel 3425238 (Bottom)...");
    const r2 = await fetch(url2);
    const d2 = await r2.json();
    console.log(d2);
}

check();
