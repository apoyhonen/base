export { clearArray, removeItem }

function clearArray(array) {
    while (array.length > 0) array.pop();
}

function removeItem(array, object) {
    array.splice(array.indexOf(object), 1)
}