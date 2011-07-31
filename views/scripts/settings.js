function load(storageKey, id) {
    var value;
    if (storageKey === "sortKey")
	value = localStorage[storageKey] || "url";
    
    var options = document.getElementById(id);
    for (var i = 0; i < options.length; i++) {
	if (options.children[i].value == value) {
	    options.children[i].selected = "true";
	    break;
	}
    }
}

function loadOptions() {
    document.getElementById("isAlways").checked = localStorage["isAlways"] == "true";
    document.getElementById("removeSameTabs").checked = localStorage["removeSameTabs"] == "true";
    load("sortKey", "sortKey");
}

function saveOptions() {
    localStorage["isAlways"] = document.getElementById("isAlways").checked;
    localStorage["removeSameTabs"] = document.getElementById("removeSameTabs").checked;
    var select = document.getElementById("sortKey");
    localStorage["sortKey"] = select.children[select.selectedIndex].value;
}
