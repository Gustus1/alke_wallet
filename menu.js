
const VALID_PASSWORD = "123456";

const VALID_EMAIL_DOMAIN = "@gmail.com";


const INITIAL_BALANCE = 1000;

const BALANCE_KEY = "alke_balance";


function getCurrentBalance() {
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    return INITIAL_BALANCE;
  }
  return Number(stored);
}

function setCurrentBalance(amount) {
  localStorage.setItem(BALANCE_KEY, String(amount));
}

function requireLogin() {
  const logged = localStorage.getItem("alke_logged_in");
  if (logged !== "true") {
    window.location.href = "index.html";
  }
}

const TX_KEY = "alke_transactions";

function getTransactions() {
  const stored = localStorage.getItem(TX_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function setTransactions(list) {
  localStorage.setItem(TX_KEY, JSON.stringify(list));
}

function addTransaction(type, amount) {
  const list = getTransactions();
  const tx = {
    type: type,
    amount: amount,
    date: new Date().toLocaleString()
  };
  list.unshift(tx);
  setTransactions(list);
}

const CONTACTS_KEY = "alke_contacts";

function getContacts() {
  const stored = localStorage.getItem(CONTACTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function setContacts(list) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
}


$(document).ready(function () {
  
  const loginForm = $("#loginForm");
  if (loginForm.length) {
    loginForm.on("submit", function (e) {
      e.preventDefault();
      const email = $("#email").val().trim();
      const password = $("#password").val().trim();

      if (
        email.endsWith(VALID_EMAIL_DOMAIN) &&
        password === VALID_PASSWORD
      ) {
        $("#loginError").addClass("d-none");
        localStorage.setItem("alke_logged_in", "true");
        window.location.href = "menu.html";
      } else {
        $("#loginError").removeClass("d-none");
      }
    });
  }

 
  if (
    window.location.pathname.includes("menu.html") ||
    window.location.pathname.includes("deposit.html") ||
    window.location.pathname.includes("sendmoney.html") ||
    window.location.pathname.includes("transactions.html")
  ) {
    requireLogin();
  }

 
  if ($("#balanceAmount").length) {
    $("#balanceAmount").text(getCurrentBalance());
  }

  
  $("#logoutBtn").on("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("alke_logged_in");
    window.location.href = "index.html";
  });

  
  if ($("#depositBalance").length) {
    $("#depositBalance").text(getCurrentBalance());
  }

  const depositForm = $("#depositForm");
  if (depositForm.length) {
    depositForm.on("submit", function (e) {
      e.preventDefault();
      const value = Number($("#depositAmount").val());

      if (isNaN(value) || value <= 0) {
        $("#depositMessage")
          .removeClass("text-success d-none")
          .addClass("text-danger")
          .text("Ingresa un monto válido.");
        return;
      }

      const current = getCurrentBalance();
      const newBalance = current + value;
      setCurrentBalance(newBalance);
      addTransaction("DEPÓSITO", value);

      $("#depositBalance").text(newBalance);
      $("#depositAmount").val("");
      $("#depositMessage")
        .removeClass("d-none text-danger")
        .addClass("text-success")
        .text("Depósito realizado con éxito.");
    });
  }

 
  if ($("#sendBalance").length) {
    $("#sendBalance").text(getCurrentBalance());
  }

  function renderContacts() {
    const list = getContacts();
    const $list = $("#contactsList");
    if (!$list.length) return;

    $list.empty();
    if (list.length === 0) {
      $list.append(
        '<li class="list-group-item bg-transparent text-muted border-0">Sin contactos guardados</li>'
      );
      return;
    }

    list.forEach(function (c) {
      $list.append(
        '<li class="list-group-item bg-transparent text-white border-secondary">' +
          c +
        "</li>"
      );
    });
  }

  renderContacts();

  const sendForm = $("#sendForm");
  if (sendForm.length) {
    sendForm.on("submit", function (e) {
      e.preventDefault();

      const contact = $("#contact").val().trim();
      const amount = Number($("#amountSend").val());
      const $msg = $("#sendMessage");

      if (!contact || isNaN(amount) || amount <= 0) {
        $msg
          .removeClass("d-none text-success")
          .addClass("text-danger")
          .text("Completa contacto y un monto válido.");
        return;
      }

      const current = getCurrentBalance();
      if (amount > current) {
        $msg
          .removeClass("d-none text-success")
          .addClass("text-danger")
          .text("Saldo insuficiente para esta transferencia.");
        return;
      }

      const newBalance = current - amount;
      setCurrentBalance(newBalance);
      addTransaction("ENVÍO a " + contact, amount);

      
      const contacts = getContacts();
      if (!contacts.includes(contact)) {
        contacts.unshift(contact);
        setContacts(contacts);
      }

      $("#sendBalance").text(newBalance);
      $("#amountSend").val("");
      $("#contact").val("");
      renderContacts();

      $msg
        .removeClass("d-none text-danger")
        .addClass("text-success")
        .text("Transferencia realizada con éxito.");
    });
  }

  
  const $txBody = $("#txTableBody");
  if ($txBody.length) {
    const txs = getTransactions();
    $txBody.empty();

    if (txs.length === 0) {
      $txBody.append(
        '<tr><td colspan="3" class="text-center text-muted">Aún no hay movimientos.</td></tr>'
      );
    } else {
      txs.forEach(function (tx) {
        const row =
          "<tr>" +
          "<td>" + tx.date + "</td>" +
          "<td>" + tx.type + "</td>" +
          '<td class="text-end">$ ' + tx.amount + "</td>" +
          "</tr>";
        $txBody.append(row);
      });
    }
  }
});
