'use strict';

const preloader = document.querySelector('.preload');
const tasksParentElem = document.querySelector('.tasks-container');
const progressBarElem = document.querySelector('.progress-bar-inner');
const progressPercentElem = document.querySelector('.progress-bar-percent');
const noTasksYet = document.querySelector('.no-tasks-yet');
const addSectionElem = document.querySelector('.add-section');
const addBtn = document.querySelector('.add-btn');
const deleteAllModal = document.querySelector('#delete-all-modal');
const deleteAllModalBtnsParent = document.querySelector('.del-modal-btns');
// context menu:
const contextMenu = document.querySelector('.context');
const contextMenuDel = document.querySelector('#context-del');
const contextMenuEdit = document.querySelector('#context-edit');
const contextMenuAdd = document.querySelector('#context-add');
const contextMenuDelAll = document.querySelector('#context-del-all');
const contextMenuTheme = document.querySelector('#context-theme');
const editTaskMenu = document.querySelector('.edit-task');

// options menu:
const themeMenu = document.querySelector('.theme-window');
const headerThemeBtn = document.querySelector("#header-theme");
const themeMenuCloseBtn = document.querySelector(".theme-window-xmark");
const themeMenuOptions = document.querySelectorAll('.theme-window-btn');
const themeMenuFontToggle = document.querySelector('#special-fonts-toggle');
const themeMenuRtlToggle = document.querySelector('#rtl-toggle');

// themes:
const themes = {
    default: {
        bgColor: "#121212",
        boxBgColor: "#1d1d1d",
        textColor: "#c8c8c8",
        borderColor: "#2b2b2b",
        gradientStart: "#00dbde",
        gradientEnd: "#fc00ff"
    },
    warmAutumn: {
        bgColor: "#000c13",
        boxBgColor: "#001620",
        textColor: "#e8e4cc",
        borderColor: "#002436",
        gradientStart: "#d62828",
        gradientEnd: "#fcbf49"
    },
    deepSea: {
        bgColor: "#001116",
        boxBgColor: "#00171f",
        textColor: "#c8c8c8",
        borderColor: "#002335",
        gradientStart: "#004576",
        gradientEnd: "#00a8e8"
    },
    retroHack: {
        bgColor: "#020202",
        boxBgColor: "#0d2818",
        textColor: "#c8c8c8",
        borderColor: "#04471c",
        gradientStart: "#099c4b",
        gradientEnd: "#12e767"
    }
}

const userData = JSON.parse(localStorage.getItem('userData'));
let currentTheme = userData?.theme ?? 'default';
const thisListArr = userData?.todoList ?? [];
let isFontON = userData?.specialFonts ?? true;
let isRtlOn = userData?.rtlToggle ?? false;
if (isFontON) {
    themeMenuFontToggle.firstElementChild.checked = true;
} else {
    themeMenuFontToggle.firstElementChild.checked = false;
}
if (isRtlOn) {
    themeMenuRtlToggle.firstElementChild.checked = true;
    tasksParentElem.style.direction = 'rtl';
    editTaskMenu.firstElementChild.style.direction = 'rtl';
    addSectionElem.firstElementChild.style.direction = 'rtl';
} else {
    themeMenuRtlToggle.firstElementChild.checked = false;
}


let isAddSectionOpen = false;
setTheme(currentTheme);
setSavedTodo();
updateProgress();
applyFonts(isFontON);


window.addEventListener('load', () => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
})

// check:
tasksParentElem.addEventListener('click', (event) => {
    const task = event.target.closest('.task');

    if (!task || !tasksParentElem.contains(task)) return;

    const checkbox = task.firstElementChild;
    checkbox.checked = !checkbox.checked;

    updateEverything();
});

// the adding section:
addBtn.addEventListener('click', () => {
    if (!isAddSectionOpen) {
        addSectionappears();
    } else {
        addSectionDisappears();
    }
})
contextMenuAdd.addEventListener('click', () => {
    addSectionappears();
})

function addSectionappears() {
    unHideElem(addSectionElem);
    addBtn.firstElementChild.style.transform = 'rotate(45deg)';
    isAddSectionOpen = true;
}
function addSectionDisappears() {
    hideElem(addSectionElem);
    addBtn.firstElementChild.style.transform = 'none';
    isAddSectionOpen = false;
}
////////////////////////

// adds the input to list:
addSectionElem.lastElementChild.addEventListener('click', (event) => {
    event.preventDefault();

    const toBeAdded = addSectionElem.firstElementChild.value.trim();

    if (toBeAdded) {
        tasksParentElem.append(
            createTaskElement(toBeAdded)
        );

        addSectionElem.firstElementChild.value = '';
        updateEverything();
        if (isFontON) {
            applyFonts(true);
        } else {
            applyFonts(false);
        }
    }
})
///////////////////

// context menu:

let rightClickedTask = null;

// Context menu - right click anywhere
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    const task = event.target.closest('.task');

    rightClickedTask = task && tasksParentElem.contains(task)
        ? task
        : null;

    // show delete and edit task only when right clicked on a task
    contextMenuDel.style.display =
        rightClickedTask ? 'block' : 'none';
    contextMenuEdit.style.display =
        rightClickedTask ? 'block' : 'none';

    contextMenu.style.display = 'block';

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    let x = event.clientX
    let y = event.clientY

    if (winWidth - x < menuWidth) {
        x = winWidth - menuWidth;
    }
    if (winHeight - y < menuHeight) {
        y = winHeight - menuHeight;
    }

    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
});

document.addEventListener('click', () => {
    // Hide context menu
    contextMenu.style.display = 'none';
});

// Delete task
contextMenuDel.addEventListener('click', () => {
    if (!rightClickedTask) return;

    deleteTask(rightClickedTask);
    rightClickedTask = null;
    contextMenu.style.display = 'none';
});

// Edit task:
contextMenuEdit.addEventListener('click', () => {
    unHideElem(editTaskMenu);
    editTaskMenu.style.transform = 'translateY(0px)';
    editTaskMenu.firstElementChild.value = rightClickedTask.lastElementChild.textContent;
})
editTaskMenu.lastElementChild.addEventListener('click', (event) => {
    event.preventDefault();

    const newText = editTaskMenu.firstElementChild.value.trim();

    if (!rightClickedTask || !newText) return;

    rightClickedTask.lastElementChild.textContent = newText;
    updateThisList();
    saveUserData();
    hideElem(editTaskMenu);

    rightClickedTask = null;
})

// Delete all tasks
contextMenuDelAll.addEventListener('click', () => {
    unHideElem(deleteAllModal);
});

deleteAllModalBtnsParent.firstElementChild.addEventListener('click', () => {
    deleteAllTasks();
    hideElem(deleteAllModal);
})
deleteAllModalBtnsParent.lastElementChild.addEventListener('click', () => {
    hideElem(deleteAllModal);
})
//////////////////

// theme menu:
contextMenuTheme.addEventListener('click', openThemeMenu);
headerThemeBtn.addEventListener('click', () => {
    if (themeMenu.style.visibility === 'visible') {
        closeThemeMenu();
    } else {
        openThemeMenu();
    }
});

themeMenuCloseBtn.addEventListener('click', closeThemeMenu);

function openThemeMenu() {
    unHideElem(themeMenu)
    themeMenu.style.transform = 'translateX(0)';
    // the button animation
    headerThemeBtn.firstElementChild.style.transform = 'translateX(-6px)';
    headerThemeBtn.lastElementChild.style.transform = 'translateX(-6px)';
}
function closeThemeMenu() {
    hideElem(themeMenu)
    themeMenu.style.transform = 'translateX(10px)';
    // the button animation
    headerThemeBtn.firstElementChild.style.transform = 'none';
    headerThemeBtn.lastElementChild.style.transform = 'none';
}


themeMenuOptions.forEach((themeMenuBtn) => {
    themeMenuBtn.addEventListener('click', () => {
        setTheme(themeMenuBtn.firstElementChild.id);
    })
})

// font toggle:
themeMenuFontToggle.addEventListener('click', () => {

    if (isFontON) {
        applyFonts(false);
        isFontON = false;
    } else {
        applyFonts(true);
        isFontON = true;
    }
    saveUserData();
})

// RTL toggle:
themeMenuRtlToggle.addEventListener('click', () => {

    isRtlOn = themeMenuRtlToggle.firstElementChild.checked;

    tasksParentElem.style.direction = isRtlOn ? 'rtl' : 'ltr';
    editTaskMenu.firstElementChild.style.direction = isRtlOn ? 'rtl' : 'ltr';
    addSectionElem.firstElementChild.style.direction = isRtlOn ? 'rtl' : 'ltr';

    saveUserData();
})
/////////////////////////

function createTaskElement(text, isDone = false) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-check');
    checkbox.checked = isDone;

    const taskText = document.createElement('p');
    taskText.classList.add('task-text');
    taskText.textContent = text;

    taskDiv.append(checkbox, taskText);

    return taskDiv;
}

function applyFonts(isEnabled) {
    tasksParentElem.classList.toggle("special-font", isEnabled);
    addSectionElem.firstElementChild.classList.toggle("special-font", isEnabled);
    editTaskMenu.firstElementChild.classList.toggle("special-font", isEnabled);
}

function updateThisList() {
    const tasks = Array.from(tasksParentElem.children);

    thisListArr.length = 0;
    tasks.forEach((task) => {
        thisListArr.push([task.lastElementChild.textContent, task.firstElementChild.checked]);
    })

}

function updateProgress() {
    const tasksCount = document.querySelectorAll('.task input[type="checkbox"]').length;
    const tasksDone = document.querySelectorAll('.task input[type="checkbox"]:checked').length;
    let progress;
    if (tasksCount === 0) {
        progress = 0;
        noTasksYet.style.display = 'block';
    } else {
        progress = Math.round((tasksDone / tasksCount) * 100);
        noTasksYet.style.display = 'none';
    }

    progressBarElem.style.width = progress + '%';
    progressPercentElem.textContent = progress + '%';
}

function deleteTask(target) {
    target.remove();
    updateEverything();
}

function deleteAllTasks() {
    tasksParentElem.replaceChildren();
    updateEverything();
}


function setTheme(themeName) {
    const theme = themes[themeName];

    if (!theme) return;

    currentTheme = themeName;
    saveUserData();

    Object.entries(theme).forEach(([key, value]) => {
        const variableName = `--${key.replace(
            /[A-Z]/g,
            letter => `-${letter.toLowerCase()}`
        )}`;

        document.documentElement.style.setProperty(
            variableName,
            value
        );
    });
}

function saveUserData() {
    const saveObj = {
        rtlToggle: themeMenuRtlToggle.firstElementChild.checked,
        specialFonts: isFontON,
        theme: currentTheme,
        todoList: thisListArr
    }
    localStorage.setItem("userData", JSON.stringify(saveObj));
}

function setSavedTodo() {
    thisListArr.forEach(([text, isDone]) => {
        tasksParentElem.append(
            createTaskElement(text, isDone)
        );
    });
}

function updateEverything() {
    updateProgress();
    updateThisList();
    saveUserData();
}

function hideElem(elem) {
    elem.style.opacity = '0';
    elem.style.visibility = 'hidden';
}
function unHideElem(elem) {
    elem.style.opacity = '1';
    elem.style.visibility = 'visible';
}
