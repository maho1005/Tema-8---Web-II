const cat = new URLSearchParams(window.location.search).get("cat") || "";

const productList = document.querySelector("#productList");
const categorySelect = document.querySelector("#categorySelect");
const count = document.querySelector("#count");
const loadMore = document.querySelector("#loadMore");
const backButton = document.querySelector("#backButton");
const sorterKnapper = document.querySelectorAll("#sortering button");

let start = 0;
const limit = 24;

let udsnit = [];
let valgtSortering = "";

// Vis den valgte kategori som overskrift.
document.querySelector("#listTitle").textContent = cat || "Alle produkter";

// Vis den valgte kategori i dropdown-menuen.
if (cat) {
  categorySelect.add(new Option(cat, cat, true, true));
}

// Hent kategorierne fra API'et.
getJSON(`${API}/categories`)
  .then((categories) => {
    categories.forEach((element) => {
      if (element.category !== cat) {
        categorySelect.add(new Option(element.category, element.category));
      }
    });
  })
  .catch(() => {
    categorySelect.title = "Kategorierne kunne ikke hentes.";
  });

// Skift kategori.
categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;

  window.location.href = category ? `productlist.html?cat=${encodeURIComponent(category)}` : "productlist.html";
});

// Tilbage til forrige side.
backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
});

// Hent flere produkter.
loadMore.addEventListener("click", getData);

// Lyt efter klik på sorterknapperne.
sorterKnapper.forEach((button) => {
  button.addEventListener("click", sorter);
});

// Hent produkter fra API'et.
function getData() {
  loadMore.disabled = true;

  const params = new URLSearchParams({
    limit: limit,
    start: start,
  });

  if (cat) {
    params.set("category", cat);
  }

  getJSON(`${API}/products?${params}`)
    .then((products) => {
      // Gem de nye produkter sammen med de tidligere indlæste.
      udsnit.push(...products);
      start += products.length;

      visSorteredeProdukter();

      count.textContent = udsnit.length ? `${udsnit.length} produkter vist` : "Ingen produkter i denne kategori.";

      loadMore.hidden = products.length < limit;
      loadMore.textContent = "Vis flere produkter";
    })
    .catch(() => {
      count.textContent = "Produkterne kunne ikke hentes.";
      loadMore.hidden = false;
      loadMore.textContent = "Prøv igen";
    })
    .finally(() => {
      loadMore.disabled = false;
    });
}

// Gem den sortering, brugeren vælger.
function sorter(e) {
  valgtSortering = e.currentTarget.textContent.trim();

  sorterKnapper.forEach((button) => {
    button.setAttribute("aria-pressed", String(button === e.currentTarget));
  });

  visSorteredeProdukter();
}

// Sortér efter pris eller navn.
function visSorteredeProdukter() {
  const sorteredeProdukter = [...udsnit];

  if (valgtSortering === "Pris lav–høj") {
    sorteredeProdukter.sort((a, b) => a.price - b.price);
  } else if (valgtSortering === "Pris høj–lav") {
    sorteredeProdukter.sort((a, b) => b.price - a.price);
  } else if (valgtSortering === "A–Z") {
    sorteredeProdukter.sort((a, b) => a.productdisplayname.localeCompare(b.productdisplayname, "da"));
  } else if (valgtSortering === "Z–A") {
    sorteredeProdukter.sort((a, b) => b.productdisplayname.localeCompare(a.productdisplayname, "da"));
  }

  // Fjern den tidligere visning, inden listen vises igen.
  productList.innerHTML = "";

  renderProducts(sorteredeProdukter);
}

// Vis produkterne med billeder, priser og betingede mærker.
function renderProducts(products) {
  products.forEach((product) => {
    const soldOut = Number(product.soldout) === 1;

    const markup = `
      <article class="product-card ${soldOut ? "soldOut" : ""}">
        <a href="productdetails.html?id=${encodeURIComponent(product.id)}">
          <div class="product-photo">
            ${imageHTML(product)}

            <div class="badges">
              ${badges(product)}
            </div>
          </div>

          <div class="card-copy">
            <p class="brand">
              ${escapeHTML(product.brandname)}
            </p>

            <h2>${escapeHTML(product.productdisplayname)}</h2>

            ${priceHTML(product)}

            <span class="more-info">Se produkt ↗</span>
          </div>
        </a>
      </article>
    `;

    productList.insertAdjacentHTML("beforeend", markup);
  });

  handleImages(productList);
}

// Start indlæsningen, når siden åbnes.
getData();
