let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let cursorStyle = document.querySelector("body");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira_tickets")) {
    // Retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
    })
}

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }
        // Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
        })
    })
}

// Listener for model priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        });
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[1];
    });
});

addBtn.addEventListener("click", (e) => {
    // Display Modal
    // Generate ticket

    // Addflag, true -> Modal Display
    // Addflag, false -> Modal none
    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    } else {
        modalCont.style.display = "none";
    }
});

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
    removeFlag
        ? (cursorStyle.style.cursor = "url(delete.png), cell")
        : (cursorStyle.style.cursor = "");
});

modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        createTicket(modalPriorityColor, textareaCont.value);
        setModalToDefault();
        addFlag = false;
    }
});

function createTicket(ticketColor, ticketContent, ticketId) {
    let id = ticketId || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");

    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">
          ${ticketContent}
        </div>
        <div class="ticket-lock">
          <i class="fas fa-lock"></i>
        </div>`;
    mainCont.appendChild(ticketCont);
    if (!ticketId) {
        ticketsArr.push({ ticketColor, ticketContent, ticketId: id });
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);

}

function handleRemoval(ticket, id) {
    //removeFlag -> true - remove ;
    ticket.addEventListener("click", (e) => {
        if (removeFlag) {
            ticket.remove();
            let idx = getTicketIdx(id);
            ticketsArr.splice(idx, 1);
            localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
            console.log(ticketsArr);
        }
    });
}

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let taskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            taskArea.setAttribute("contenteditable", "true");
        } else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            taskArea.setAttribute("contenteditable", "false");
        }
        ticketsArr[ticketIdx].ticketContent = taskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    });
}

function handleColor(ticket, id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        console.log(ticketIdx)
        let currentTicketColor = ticketColor.classList[1];
        //Get Ticket Color idx
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        });
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // MOdify the data in localStorage (color priority)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    });
}

function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id;
    })
    return ticketIdx;
}


function setModalToDefault() {
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}