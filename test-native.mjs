async function testNative() {
  try {
    const res = await fetch('https://www.kalindicollege.in/previous-year-qpapers/');
    console.log(res.status);
    console.log("Success");
  } catch (err) {
    console.error("NATIVE FETCH ERROR:", err);
  }
}
testNative();
