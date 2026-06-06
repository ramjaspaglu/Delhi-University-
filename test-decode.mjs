import fetch from 'node-fetch';
async function run() {
  const res = await fetch('http://localhost:3000/api/kalindi-papers');
  const items = await res.json();
  let crashed = false;
  items.links.forEach((l) => {
    try {
      decodeURIComponent(l.name);
    } catch (e) {
      console.log("CRASH ON:", l.name);
      crashed = true;
    }
  });
  if (!crashed) console.log("NO CRASHES");
}
run();
