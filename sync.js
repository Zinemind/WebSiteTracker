const request = indexedDB.open("traces");
let db;
let count = 0;
request.onupgradeneeded = function() {
    // The database did not previously exist, so create object stores and indexes.
    const db = request.result;
    const snapshots = db.createObjectStore("snapshots", {keyPath: "id"});

};

request.onsuccess = function() {
    db = request.result;
};

addEventListener("message", event => {
    console.log(event);
    if(event.data == "sync"){
        const tx = db.transaction("snapshots", "readwrite");
        const snapshots = tx.objectStore("snapshots");
        let request = snapshots.getAll();
        request.onsuccess = event => {
            const data = event.target.result;
            console.log(data);
            snapshots.clear();
        };
    } else {
        const tx = db.transaction("snapshots", "readwrite");
        const snapshots = tx.objectStore("snapshots");
        snapshots.put({id: count++,...event.data});
    }
});
