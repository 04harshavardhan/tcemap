import { Control } from "ol/control";
import { getCenter } from "ol/extent";

class SearchControl extends Control {
  /**
   * @param {Object} [control_options] Control control_options.
   */
  constructor(control_options) {
    const { source, select } = control_options;

    const element = document.createElement("div");
    element.id = "SearchBar";
    element.className = "ol-control ol-search";

    const wrapper = document.createElement("div");
    wrapper.className = "ol-search-wrapper";

    const searchInput = document.createElement("input");
    searchInput.className = "ol-search-input ol-hidden";
    searchInput.type = "text";
    searchInput.placeholder = "Search";

    const autoComplete = document.createElement("div");
    autoComplete.className = "ol-search-autocomplete ol-hidden";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ol-search-toggle";
    toggleBtn.innerHTML = `<span class="material-symbols-outlined">
    search
    </span>`;

    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(searchInput);
    element.appendChild(wrapper);
    element.appendChild(autoComplete);

    super({
      element: element,
    });

    this.select = select;

    this.searchData = {};

    source.forEach((src) => {
      updateSearchData({
        obj: this.searchData,
        source: src,
        element: this.autoComplete,
      });
    });

    this.searchInput = searchInput;
    this.autoComplete = autoComplete;

    toggleBtn.addEventListener("click", () => {
      autoComplete.classList.toggle("ol-hidden");
      searchInput.classList.toggle("ol-hidden");
      this.searchInput.focus();
    });

    searchInput.addEventListener("input", (e) => {
      this.handleSearchInput();
    });
  }

  handleSearchInput() {
    const query = this.searchInput.value.toLowerCase();

    if (query === "") {
      return;
    }

    const list = document.createElement("ul");

    // find all matches
    for (const searchId in this.searchData) {
      if (this.searchData.hasOwnProperty(searchId)) {
        const feature = this.searchData[searchId];

        if (searchId.toLowerCase().includes(query)) {
          // add autocomplete
          const link = document.createElement("li");
          link.className = "ol-autocomplete-link";
          link.innerHTML = `<button>${searchId}</button>`;

          list.appendChild(link);

          link.addEventListener("click", () => {
            const view = this.getMap().getView();

            view.fit(feature.getGeometry(), {
              padding: [40, 40, 40, 40],
              duration: 500,
            });
            this.select.getFeatures().clear();
            this.select.getFeatures().push(feature);
            this.select.dispatchEvent({
              type: "select",
              selected: [feature],
              deselected: [],
            });
          });
        }
      }

      this.autoComplete.replaceChildren(list);
    }
  }
}

function updateSearchData({ obj, source }) {
  source.on("change", (evt) => {
    const src = evt.target;

    if (src.getState() === "ready") {
      const features = src.getFeatures();

      features.forEach((feature) => {
        const searchId = feature.get("id");

        if (searchId) {
          const extent = feature.getGeometry().getExtent();
          const center = getCenter(extent);

          obj[searchId] = feature;
        }
      });
    }
  });
}

export default SearchControl;
