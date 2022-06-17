const HISTORY_COUNT = 4;
const MAIN_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';
const TOOLTIP_DELAY = 500;

const tooltip = createTolltip();
let timeoutTooltip;

function createElements(data, date) {

	if (!data) return;
	if (!data.Valute) return;

	const valuteList = document.querySelector(".cont__list");

	if (!valuteList.children.length) {

		for (let val in data.Valute) {

			const valute = data.Valute[val];
			const charCode = valute.CharCode;
			const valuteValue = valute.Value / valute.Nominal;
			const valutePrevious = valute.Previous / valute.Nominal;
			const valuteName = valute.Name;
			const diff =
				valuteValue < valutePrevious
					? ((valutePrevious - valuteValue) / valutePrevious) * -100
					: ((valuteValue - valutePrevious) / valutePrevious) * 100;

			const element = document.createElement(`li`);
			element.className = "cont__item";
			element.innerHTML = `
				<div class="valute-charCode">${charCode}</div>
				<div class="valute-value">${valuteValue.toFixed(4)}</div>
				<div class="valute-diff-numb">${diff.toFixed(2)}%</div>
			`;

			setValueColor(element, diff);

			valuteList.appendChild(element);

			const archiveList = document.createElement(`ul`);
			archiveList.className = "archive-valute-list non";
			valuteList.appendChild(archiveList);

			element.addEventListener("click", function () {

				if (archiveList.classList.contains("non")) {
					archiveList.classList.remove("non");
				} else {
					archiveList.classList.add("non");
				}
			});

			element.querySelector(".valute-charCode").addEventListener("mouseover", function (el) {

				timeoutTooltip = setTimeout(() => {

					tooltip.textContent = valuteName;
					element.appendChild(tooltip);

				}, TOOLTIP_DELAY);
				// tooltip.textContent = valuteName;
				// element.appendChild(tooltip);
			});

			element.querySelector(".valute-charCode").addEventListener("mouseout", function (el) {

				clearTimeout(timeoutTooltip);

				if (tooltip.parentNode) element.removeChild(tooltip);
			});
		}

	} else {

		const valuteItem = document.getElementsByClassName(`cont__item`);

		for (let val of valuteItem) {

			const archiveList = val.nextSibling;
			const charCodeNode = val.getElementsByClassName('valute-charCode')[0];
			const archVal = charCodeNode.textContent;

			if (data.Valute[archVal]) {

				const valuteValue = data.Valute[archVal].Value / data.Valute[archVal].Nominal;
				const valutePrevious = data.Valute[archVal].Previous / data.Valute[archVal].Nominal;
				const diff =
					valuteValue < valutePrevious
						? ((valutePrevious - valuteValue) / valutePrevious) * -100
						: ((valuteValue - valutePrevious) / valutePrevious) * 100;

				const element = document.createElement(`li`);
				element.className = "archive-valute-item";
				element.innerHTML = `
					<div class="valute-date">${date}</div>
					<div class="archive-value">${valuteValue.toFixed(4)}</div>
					<div class="valute-diff-numb">${diff.toFixed(2)}%</div>
				`;

				setValueColor(element, diff);

				archiveList.appendChild(element);
			}
		}
	}
}

function createTolltip() {

	const toolElement = document.createElement("div");
	toolElement.className = "tooltip";

	return toolElement;
}

function setValueColor(elem, numb) {

	const divValDiff = elem.querySelector(".valute-diff-numb");

	if (numb < 0) {
		divValDiff.classList.add("negative");
	} else {
		divValDiff.classList.add("positive");
	}
}

async function getData(url, formDate, count = 0) {

	url = url || MAIN_URL;
	formDate = formDate || new Date().toISOString().slice(0, 10);
	let data;
	let timeoutDelay = 0;

	if (!localStorage.hasOwnProperty(formDate)) {

		let response = await fetch(url);

		if (response.ok) {

			data = await response.json();
			localStorage.setItem(data.Date.slice(0, 10), JSON.stringify(data));
		}

		timeoutDelay = 1000 / 5;

	} else {

		data = JSON.parse(localStorage.getItem(formDate));
	}

	createElements(data, formDate);

	count++;

	if (count < HISTORY_COUNT && data) {

		url = "https:" + data.PreviousURL; // получаем URL за предыдущий день
		formDate = data.PreviousDate.slice(0, 10); // выдираем дату дла ключа в local storage

		setTimeout(() => {
			getData(url, formDate, count);
		}, timeoutDelay);
	}
}

getData();

function getElement(e) {
	return e.nextElementSibling;
}
let cont = document.getElementsByClassName("cont__item");



