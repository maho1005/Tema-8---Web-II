const productId = new URLSearchParams(window.location.search).get("id");

const productContainer = document.querySelector("#productContainer");
const backButton = document.querySelector("#backButton");

// Tilbage til forrige side.
backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "productlist.html";
  }
});

// Hent det produkt, hvis id står i adressen.
function getData() {
  if (!productId || !/^\d+$/.test(productId)) {
    productContainer.textContent = "Vælg et produkt fra produktlisten for at se detaljer.";
    return;
  }

  getJSON(`${API}/products/${encodeURIComponent(productId)}`)
    .then(renderProduct)
    .catch(() => {
      productContainer.textContent = "Produktet kunne ikke hentes. Gå tilbage til produktlisten, eller prøv igen.";
    });
}

// Vis produktets oplysninger på siden.
function renderProduct(data) {
  if (!data.id || !data.productdisplayname) {
    throw new Error("Produktet findes ikke.");
  }

  const soldOut = Number(data.soldout) === 1;

  const categoryLink = `productlist.html?cat=${encodeURIComponent(data.category)}`;

  document.title = `${data.productdisplayname} | Fashion`;

  productContainer.innerHTML = `
    <div class="detail-photo ${soldOut ? "soldOut" : ""}">
      ${imageHTML(data)}
    </div>

    <div class="detail-copy">
      <p class="eyebrow">${escapeHTML(data.brandname)}</p>

      <h1>${escapeHTML(data.productdisplayname)}</h1>

      <div class="badges">
        ${badges(data)}
      </div>

      ${priceHTML(data)}

      <p class="availability">
        ${soldOut ? "Dette produkt er udsolgt." : "På lager"}
      </p>

      <dl>
        <dt>Kategori</dt>
        <dd>${escapeHTML(data.category)}</dd>

        <dt>Type</dt>
        <dd>${escapeHTML(data.articletype)}</dd>

        <dt>Farve</dt>
        <dd>${escapeHTML(data.basecolour)}</dd>

        <dt>Produktnummer</dt>
        <dd>${escapeHTML(data.id)}</dd>
      </dl>

      <a class="button" href="${categoryLink}">
        Se flere i kategorien ↗
      </a>
    </div>
  `;

  handleImages(productContainer);
}

getData();
