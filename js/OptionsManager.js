class OptionsManager {
    constructor() {
        this.options = {};

        const optionElems = document.getElementsByClassName("option");

        for (var i = 0; i < optionElems.length; i++) {
            const elem = optionElems.item(i);
            const name = elem.id;
            this.options[name] = elem;
        }
    }

    linkHide(name, elements, checked) {
        const optionElem = this.options[name];

        if (optionElem && optionElem.type === "checkbox") {
            optionElem.addEventListener("change", () => {
                elements.forEach(elem => {
                    elem.display = optionElem.checked === checked ? "" : "none";
                });
            });
        }
    }

    linkRanges() {
        for (const name in this.options) {
            if (!this.options.hasOwnProperty(name)) continue;

            const elem = this.options[name];

            if (elem.type === "range") {
                const manual = document.getElementById(name + "-manual");
                if (manual) {
                    manual.value = elem.value;
                    manual.min = elem.min;
                    manual.max = elem.max;
    
                    elem.addEventListener("change", () => {
                        manual.value = elem.value;
                    });

                    manual.addEventListener("change", () => {
                        elem.value = manual.value;
                    });
                }
            }
        }
    }

    get(name) {
        const elem = this.options[name];

        if (elem) {
            return elem.type === "checkbox" ? elem.checked : elem.value;
        }
    }

    load() {
        for (const name in this.options) {
            if (!this.options.hasOwnProperty(name)) continue;

            const elem = this.options[name];
            const stored = JSON.parse(window.localStorage.getItem(name));
            this.options[name] = elem;

            if (stored !== null) {
                if (elem.type === "checkbox") {
                    elem.checked = stored;
                } else {
                    elem.value = stored;
                }

                elem.dispatchEvent(new Event("change"));
            }

            elem.addEventListener("change", () => {
                const value = elem.type === "checkbox" ? elem.checked : elem.value;
                window.localStorage.setItem(name, value);
            });
        }
    }
}