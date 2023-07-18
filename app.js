const containerDiv = document.getElementById("vizContainer");
const culturalBtn = document.getElementById('cultural');
const naturalBtn = document.getElementById('natural');
const mixBtn = document.getElementById('mix');

let uniqueValues;
let filterCountry;

const url = 'https://public.tableau.com/views/world_heritage/UNESCOWORLDHERITAGEMAP';

const option = {
  hideTabs: true,
  height: 700,
  width: 1200,
  device: 'desktop',
  onFirstInteractive: function () {
    console.log("Hey, my dashboard is ready");
    getUnderlyingData();
  },
  onFirstVizSizeKnown: function () {
    console.log("Hey, my dashboard has a size!");

    viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, function () {
      const sidebar = document.querySelector(".sidebar");
      const vizContainer = document.getElementById("vizContainer");

      if (sidebar.style.left === "0px") {
        sidebar.style.left = "-400px";
        vizContainer.classList.remove("shifted");
      } else {
        sidebar.style.left = "0px";
        vizContainer.classList.add("shifted");
      }
    });

    viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, countSelectedMarks);
  }
};

let viz;

function initViz() {
  viz = new tableau.Viz(containerDiv, url, option);
}

document.addEventListener("DOMContentLoaded", initViz);

function removeClickedClass() {
  culturalBtn.classList.remove('clicked');
  naturalBtn.classList.remove('clicked');
  mixBtn.classList.remove('clicked');
}

let isButtonClickedCultural = false;
let isButtonClickedNatural = false;
let isButtonClickedMixed = false;

// Cultural Button
function filterTypeCultural() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.applyFilterAsync("Category", "Cultural", tableau.FilterUpdateType.REPLACE);
}

document.getElementById("cultural").addEventListener("click", function () {
  culturalBtn.classList.toggle('clicked');
  isButtonClickedCultural = !isButtonClickedCultural;
  console.log(isButtonClickedCultural);

  if (isButtonClickedCultural) {
    filterTypeCultural();
    isButtonClickedNatural = false;
    naturalBtn.classList.remove('clicked');
    isButtonClickedMixed = false;
    mixBtn.classList.remove('clicked');
  } else {
    clearFiltersType();
  }
});

// Natural Button
function filterTypeNatural() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.applyFilterAsync("Category", "Natural", tableau.FilterUpdateType.REPLACE);
}

document.getElementById("natural").addEventListener("click", function () {
  naturalBtn.classList.toggle('clicked');
  isButtonClickedNatural = !isButtonClickedNatural;

  if (isButtonClickedNatural) {
    filterTypeNatural();
    isButtonClickedCultural = false;
    culturalBtn.classList.remove('clicked');
    isButtonClickedMixed = false;
    mixBtn.classList.remove('clicked');
  } else {
    clearFiltersType();
  }
});

// Mixed Button
function filterTypeMix() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.applyFilterAsync("Category", "Mixed", tableau.FilterUpdateType.REPLACE);
}

document.getElementById("mix").addEventListener("click", function () {
  mixBtn.classList.toggle('clicked');
  isButtonClickedMixed = !isButtonClickedMixed;

  if (isButtonClickedMixed) {
    filterTypeMix();
    isButtonClickedCultural = false;
    culturalBtn.classList.remove('clicked');
    isButtonClickedNatural = false;
    naturalBtn.classList.remove('clicked');
  } else {
    clearFiltersType();
  }
});

// SEARCH Bar part
function getUnderlyingData() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheet = activeSheet.getWorksheets();
  const worksheets = sheet[0];

  options = {
    maxRows: 0,
    ignoreAliases: false,
    ignoreSelection: true,
    includeAllColumns: false
  };

  worksheets.getUnderlyingDataAsync(options).then(function (t) {
    table = t;
    const objects = table.getData();
    const fifthElements = [];

    for (const item of objects) {
      if (item.length >= 6) {
        const fifthElement = item[6];
        fifthElements.push(fifthElement);
      }
    }

    uniqueValues = [...new Set(fifthElements.map(fifthElements => fifthElements.value))];
  });
}

const input = document.getElementById("input");

input.addEventListener("keyup", (e) => {
  removeElements();

  if (input.value === "") {
    clearFilters();
  } else {
    for (const i of uniqueValues) {
      if (i.toLowerCase().startsWith(input.value.toLowerCase()) &&
        input.value != "") {
        const listItem = document.createElement("li");
        listItem.classList.add("list-items");
        listItem.style.cursor = "pointer";
        listItem.setAttribute("onclick", `displayNames('${i}')`);
        const word = "<b>" + i.substr(0, input.value.length) + "</b>" + i.substr(input.value.length);
        listItem.innerHTML = word;
        document.querySelector(".list").appendChild(listItem);
      }
    }
  }
});

function displayNames(value) {
  input.value = value;
  filterCountry = value;
  filterbyCountry();
  removeElements();
}

function removeElements() {
  const items = document.querySelectorAll(".list-items");
  items.forEach((item) => {
    item.remove();
  });
}

function filterbyCountry() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.applyFilterAsync("States Name En", filterCountry, tableau.FilterUpdateType.REPLACE);
}

function clearFilters() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.clearFilterAsync("States Name En");
}

function clearFiltersType() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];
  sheetToFilter.clearFilterAsync("Category");
}

function countSelectedMarks() {
  const workbook = viz.getWorkbook();
  const activeSheet = workbook.getActiveSheet();
  const sheets = activeSheet.getWorksheets();
  const sheetToFilter = sheets[0];

    sheetToFilter.getSelectedMarksAsync().then(function (selectedMarks) {
        var sidebar = document.querySelector(".sidebar");
        sidebar.innerHTML = "";
      
        if (selectedMarks.length > 0) {
          var selectedMark = selectedMarks[0];
      
          var name = selectedMark.impl.$3.$4[4].value;
          var country = selectedMark.impl.$3.$4[6].value;
          var description = selectedMark.impl.$3.$4[5].value;
          var year = selectedMark.impl.$3.$4[7].value;
      
          var contentContainer = document.createElement("div");
          contentContainer.classList.add("content-container");
      
          var textElement = document.createElement("div");
          textElement.classList.add("text-element");
          textElement.contentEditable = true;
          textElement.innerHTML = `
            <h3>${name}</h3>
            <br>
            <p>Country: <b>${country}</b></p>
            <p>Year: <b>${year}</b></p>
            <br>
            <p>${description}</p>
          `;
      
          contentContainer.appendChild(textElement);
          sidebar.appendChild(contentContainer);
        }
      });
     }