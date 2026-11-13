
const area = document.querySelector(".logo-lanterna");

area.addEventListener("pointermove", (event) => {
  const rect = area.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  area.style.setProperty("--x", `${x}px`);
  area.style.setProperty("--y", `${y}px`);
});
