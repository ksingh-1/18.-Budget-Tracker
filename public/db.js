let db;

//Creates A New DB Request For a "Budget" Database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    //An Object Store Named "Pending" Is Created And Set To Auto Incrementing
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    //Online Status of Browser Is Returned

    //Checks If App is Online, Before Checking From Database
    if (navigator.onLine) {
        checkDatabase();
    }
};
//If An Error, Console Log "Oopsie!"
request.onerror = function (event) {
    console.log("Oopsie! " + event.target.errorCode);
};

function saveRecord(record) {
    //Creates A Transaction On Pending DB With Read/Write Access
    const transaction = db.transaction(["pending"], "readwrite");

    //Access Pending Object Store
    const store = transaction.objectStore("pending");
    //Adds A Record To Store With Add Method
    store.add(record);
}

function checkDatabase() {
    //Opens A Transaction On Pending DB
    const transaction = db.transaction(["pending"], "readwrite");
    //Accesses Pending Object Store
    const store = transaction.objectStore("pending");
    //Gets All Records From The Store And Sets Them To Variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    //If Successfully Responded, Opens A Transaction On Pending DB
                    const transaction = db.transaction(["pending"], "readwrite");

                    //Access Pending Object Store
                    const store = transaction.objectStore("pending");

                    //Clear All Items In Store
                    store.clear();
                });
        }
    };
}

//Listen For App To Be Back Online
window.addEventListener("online", checkDatabase);