const textInput = document.getElementById("textInput");
const textStatus = document.getElementById("textStatus");
const savedText = document.getElementById("savedText");
const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const savedFiles = document.getElementById("savedFiles");

function showPage(pageId, button) {
document.querySelectorAll(".page").forEach(page => {
page.classList.add("hidden");
});

document.getElementById(pageId).classList.remove("hidden");

document.querySelectorAll("nav button").forEach(btn => {
btn.classList.remove("active");
});

button.classList.add("active");
}

function loadText() {
const text = localStorage.getItem("myStorageText");

if (text !== null) {
savedText.textContent = text || "Empty text.";
}
}

function saveText() {
try {
localStorage.setItem("myStorageText", textInput.value);
savedText.textContent = textInput.value || "Empty text.";
textStatus.textContent = "Text saved on this device.";
} catch (error) {
textStatus.textContent = "Could not save the text.";
}
}

function loadFiles() {
savedFiles.replaceChildren();

const count = Number(localStorage.getItem("myStorageFileCount") || 0);

for (let i = 0; i < count; i++) {
const raw = localStorage.getItem("myStorageFile" + i);

if (!raw) continue;

try {
  const file = JSON.parse(raw);
  displayFile(file);
} catch (error) {
  console.error("Could not load saved file.", error);
}

}
}

function displayFile(file) {
const item = document.createElement("div");
const title = document.createElement("p");
title.textContent = file.name;
item.appendChild(title);

if (file.type.startsWith("image/")) {
const image = document.createElement("img");
image.src = file.data;
image.alt = file.name;
item.appendChild(image);
} else if (file.type.startsWith("video/")) {
const video = document.createElement("video");
video.src = file.data;
video.controls = true;
item.appendChild(video);
}

savedFiles.appendChild(item);
}

function saveFiles() {
const files = Array.from(fileInput.files);

if (files.length === 0) {
fileStatus.textContent = "Choose at least one image or video.";
return;
}

const existingCount = Number(
localStorage.getItem("myStorageFileCount") || 0
);

let processed = 0;
let failed = 0;

files.forEach(file => {
if (!file.type.startsWith("image/") &&
!file.type.startsWith("video/")) {
failed++;
processed++;
finish();
return;
}

const reader = new FileReader();

reader.onload = () => {
  try {
    const index = existingCount + processed;
    const record = {
      name: file.name,
      type: file.type,
      data: reader.result
    };

    localStorage.setItem("myStorageFile" + index, JSON.stringify(record));
  } catch (error) {
    failed++;
  }

  processed++;
  finish();
};

reader.onerror = () => {
  failed++;
  processed++;
  finish();
};

reader.readAsDataURL(file);

});

function finish() {
if (processed !== files.length) return;

const savedCount = processed - failed;

localStorage.setItem(
  "myStorageFileCount",
  String(existingCount + savedCount)
);

loadFiles();
fileStatus.textContent = savedCount + " file(s) saved on this device." +
  (failed ? " " + failed + " file(s) failed." : "");
fileInput.value = "";

}
}

loadText();
loadFiles();
