/*
  Task:     Write a 2 page web application with user validation and invoice information demonstaration

  Input:    sername, password(validation(if user exists redirect invoice page, otherwise send error in console))

  Process:  Choose one of the invoices of current user's invoice list
            Calculate the total amount of each product from chosen invoice

  Display:  Display products, quantity and total amount of all products of the specific invoice
*/

async function checkUsernamePassword(username, password) {
  const response = await fetch(
    `https://invoicesapi20210913135422.azurewebsites.net/users?$filter=Name%20eq%20%27${username}%27%20and%20Password%20eq%20%27${password}%27`
  );

  const user = await response.json();

  let valid = user.value.length > 0;

  if (valid) {
    sessionStorage.setItem("userId", user.value[0].UserId);
    Redirect();
  } else {
    console.error("Invalid Username or Password");
  }
}

function Redirect() {
  window.location = "http://127.0.0.1:5500/index2.html#home";
}

async function invoices() {
  const userId = sessionStorage.getItem("userId");
  const response = await fetch(
    `https://invoicesapi20210913135422.azurewebsites.net/invoices?$filter=%20UserId%20eq%20${userId}`
  );
  const invoices = await response.json();
  let valid = invoices.value.length > 0;

  if (valid) {
    let array = new Array();
    const response = await fetch(
      `https://invoicesapi20210913135422.azurewebsites.net/invoicelines?$apply=groupby((InvoiceId),%20aggregate(Quantity%20with%20sum%20as%20Total))`
    );
    const totals_res = await response.json();
    totals = {};
    for (const e of totals_res.value) {
      totals[e.InvoiceId] = e.Total;
    }

    array.push(["", "Invoice Name", "Paid Date", "Total Amount"]);
    for (const inv of invoices.value) {
      array.push([
        `<input type="radio" name=1 onclick=InvoiceLines("${inv.InvoiceId}") />`,
        inv.Name,
        inv.PaidDate,
        totals[inv.InvoiceId],
      ]);
    }

    GenerateTable(array, "dvTable");
  }
}

async function InvoiceLines(invoiceId) {
  const response = await fetch(
    `https://invoicesapi20210913135422.azurewebsites.net/invoicelines?$filter=InvoiceId%20eq%20${invoiceId}`
  );
  const invoiceLines = await response.json();
  let valid = invoiceLines.value.length > 0;

  if (valid) {
    let arr = new Array();
    arr.push(["Product", "Price Per Unit", "Quantity", "Total Amount"]);
    for (const elem of invoiceLines.value) {
      const response = await fetch(
        `https://invoicesapi20210913135422.azurewebsites.net/products?$filter=ProductId%20eq%20${elem.ProductId}`
      );
      const product = await response.json();
      arr.push([
        product.value[0].Name,
        product.value[0].Price,
        elem.Quantity,
        product.value[0].Price * elem.Quantity,
      ]);
    }

    GenerateTable(arr, "dvTable1");
  }
}

function GenerateTable(array, tableId) {
  let table = document.createElement("TABLE");
  table.border = "1";
  let columnCount = array[0].length;
  let row = table.insertRow(-1);
  for (let i = 0; i < columnCount; i++) {
    let headerCell = document.createElement("TH");
    headerCell.innerHTML = array[0][i];
    row.appendChild(headerCell);
  }

  for (let i = 1; i < array.length; i++) {
    row = table.insertRow(-1);
    for (let j = 0; j < columnCount; j++) {
      let cell = row.insertCell(-1);
      cell.innerHTML = array[i][j];
    }
  }

  let dvTable = document.getElementById(tableId);
  dvTable.innerHTML = "";
  dvTable.appendChild(table);
}
