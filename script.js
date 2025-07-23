const dropZone = document.getElementById("drop-zone")
const downloadBtn = document.getElementById("download")
const resetBtn = document.getElementById("reset")
const formatRadios = document.querySelectorAll('input[name="format"]')
const escapedOutput = document.getElementById("escaped-output")
const previewOutput = document.getElementById("preview-output")
const tabButtons = document.querySelectorAll(".tab-button")

let escapedContent = ""
let rawMarkdown = ""
let originalFileName = "markdown"

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault()
  dropZone.style.background = "#e0f7fa"
})

dropZone.addEventListener("dragleave", () => {
  dropZone.style.background = "#f9f9f9"
})

dropZone.addEventListener("drop", (e) => {
  e.preventDefault()
  dropZone.style.background = "#f9f9f9"
  const file = e.dataTransfer.files[0]

  if (!file || !file.name.endsWith(".md")) {
    escapedOutput.textContent = "Please drop a valid .md file."
    previewOutput.innerHTML = ""
    downloadBtn.disabled = true
    resetBtn.disabled = true
    return
  }

  originalFileName = file.name.replace(/\.md$/, "")
  const reader = new FileReader()

  reader.onload = function (evt) {
    rawMarkdown = evt.target.result
    escapedContent = rawMarkdown
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, "\\n")

    const selectedFormat = getSelectedFormat()

    escapedOutput.textContent = formatOutput(escapedContent, selectedFormat)
    previewOutput.innerHTML = marked.parse(rawMarkdown)
    downloadBtn.disabled = false
    resetBtn.disabled = false
  }

  reader.readAsText(file)
})

downloadBtn.addEventListener("click", () => {
  const selectedFormat = getSelectedFormat()
  const blob = new Blob(
    [
      selectedFormat === "json"
        ? `{ "content": "${escapedContent}" }`
        : `"${escapedContent}"`,
    ],
    { type: "application/json" }
  )
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download =
    selectedFormat === "json"
      ? `${originalFileName}.json`
      : `${originalFileName}.txt`
  link.click()
  URL.revokeObjectURL(url)
})

resetBtn.addEventListener("click", () => {
  location.reload()
})

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")

    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active")
    })

    const target = btn.dataset.tab
    document.getElementById(`${target}-output`).classList.add("active")
  })
})

function getSelectedFormat() {
  return [...formatRadios].find((r) => r.checked).value
}

function formatOutput(content, format) {
  return format === "json" ? `{ "content": "${content}" }` : `"${content}"`
}
