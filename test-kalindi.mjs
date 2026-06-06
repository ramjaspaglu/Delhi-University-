import fetch from 'node-fetch';
async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/kalindi-papers');
    const text = await res.text();
    console.log(res.status);
    console.log(text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
testApi();
