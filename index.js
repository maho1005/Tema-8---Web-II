const catListeContainer = document.querySelector("#catListeContainer");

getJSON(`${API}/categories`)
  .then(visData)
  .catch(() => {
    catListeContainer.textContent = "Kategorierne kunne ikke hentes. Prøv at genindlæse siden.";
  });

function visData(categories) {
  catListeContainer.innerHTML = "";

  categories.forEach((element) => {
    catListeContainer.innerHTML += `
      <a
        class="category-card"
        href="productlist.html?cat=${encodeURIComponent(element.category)}"
      >
        <h3>${escapeHTML(element.category)}</h3>
        <span aria-hidden="true">↗</span>
      </a>
    `;
  });
}
