const worker = new Worker("/sync.js");

/**
 * Taking data from HTML Element
 * @param {HTMLElement} element HTML Element
 * @returns {object} Tracking data from element 
 */
createTrackingData = (element) => {
    //TODO: Improve the tracking data by element type and element details
    return {
        id: element.id,
        name: element.name,
        value: element.value
    };
}

/**
 * Create snapshot trigger
 * @param {Event} e snapshot event data
 * @returns {object} Trigger data from snapshot event data 
 */
createTrigger = (e) => {
    //TODO: Improve data by trigger event type and data
    console.log(e);
    return {
        timeStamp: e.timeStamp,
        type: e.type,

    };
}

/**
 * Create snap shot from HTML Elements
 *  @param {Collection} Collection of HTML Elements
 * @returns {object} Tracking data from element 
 */
createSnapShot = (detail, elements) => {
    const snapshot = {
        createdTime: new Date(),
        trace: [],
        trigger: createTrigger(detail)
    };
    if (elements) {
        for (const element of elements) {
            snapshot.trace.push(createTrackingData(element));
        }
    }
    return snapshot;
}

// Adding an event lisner in document named snapshot to create snapshot of current screen 
document.addEventListener("snapshot", e => {
    const elements = document.querySelectorAll("[track]");
    const snapshot = createSnapShot(e.detail, elements);
    worker.postMessage(snapshot);
});


// Calling the sync of DB data to the server
setInterval(() => {
    worker.postMessage("sync");
}, 30 * 1000)

/**
 * Trigger SnapShot event
 * @param {Event} e snapshot triggering event
 */
triggerSnapShot = (e) => {
    const snapshot = new CustomEvent('snapshot', { detail: { event: e } });
    document.dispatchEvent(snapshot);
}

/** 
 * Add trigger to snapshot on events provvided in the 'snapOn' attribute
 * * @param {HTMLElement} element HTML Element
 */
addTriggerForSnapShot = (element) => {
    const snapOn = element.getAttribute('snapOn');
    if (snapOn) {
        const events = snapOn.split(" ");
        events.forEach(eName => {
            eName = eName.trim();
            if (eName) {
                element.addEventListener(eName, triggerSnapShot);
            }
        })

    }
}

/**
 * Remove snapshot triggeer from elemnt
 * @param {HTMLElement} element element to remove trigger
 */
removeTriggerForSnapShot = (element) => {
    const snapOn = element.getAttribute('snapOn');
    if (snapOn) {
        const events = snapOn.split(" ");
        events.forEach(eName => {
            if (eName) {
                element.removeEventListener(eName, triggerSnapShot);
            }
        });
    }
}

// 'DOMContentLoaded' Listener for updating the trigger for new elements.
window.addEventListener('DOMContentLoaded', (event) => {
    const elements = document.querySelectorAll("[snapOn]");
    console.log(elements);
    if (elements) {
        for (const element of elements) {
            addTriggerForSnapShot(element);
        }
    }
    var mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach((addedNode) => {
                addTriggerForSnapShot(addedNode);
            });
            mutation.removedNodes.forEach((removedNode) => {
                removeTriggerForSnapShot(removedNode);
            });
        });
    });

    // Starts listening for changes in the root HTML element of the page.
    mutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
});


