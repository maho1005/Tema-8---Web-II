const API = "https://kea-alt-del.dk/t7/api";

// Hent JSON og kontrollér, at serveren svarer korrekt.
async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Data kunne ikke hentes.");
  }

  return response.json();
}

// Sørg for, at tekst fra API'et vises som tekst i HTML.
function escapeHTML(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(/[&<>"']/g, (character) => characters[character]);
}

// Formatér tal med dansk komma.
function number(value) {
  return Number(value).toLocaleString("da-DK", {
    maximumFractionDigits: 2,
  });
}

// Vis enten almindelig pris eller tilbudspris og førpris.
function priceHTML(product) {
  const discount = Number(product.discount) || 0;
  const price = Number(product.price);

  const salePrice = Math.round(price - (price * discount) / 100);

  return discount > 0
    ? `
      <p class="price">
        <strong>${number(salePrice)},–</strong>
        <del>${number(price)},–</del>
      </p>
    `
    : `
      <p class="price">
        <strong>${number(price)},–</strong>
      </p>
    `;
}

// Vis kun mærkerne, når betingelserne er opfyldt.
function badges(product) {
  const soldOut = Number(product.soldout) === 1;
  const discount = Number(product.discount) || 0;

  return `
    ${soldOut ? '<span class="badge sold">Udsolgt</span>' : ""}

    ${discount > 0 ? `<span class="badge sale">Tilbud −${number(discount)}%</span>` : ""}
  `;
}

// Produktets id bruges i billedadressen.
function imageHTML(product) {
  return `
    <img
      src="https://kea-alt-del.dk/t7/images/webp/640/${encodeURIComponent(product.id)}.webp"
      alt="${escapeHTML(product.productdisplayname)}"
      loading="lazy"
    />
  `;
}

// Vis en tekst, hvis et produktbillede ikke kan indlæses.
function handleImages(container) {
  container.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const text = document.createElement("p");
        text.className = "image-fallback";
        text.textContent = "Billede mangler";

        img.replaceWith(text);
      },
      { once: true },
    );
  });
}
