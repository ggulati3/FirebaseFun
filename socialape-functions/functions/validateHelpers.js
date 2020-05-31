
// chck for empty spaces in email
const isEmpty = (str) => {
    if(str.trim() === '') return true;
    return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true; // string is formatted as a proper email
    return false;

}

module.exports = {
    isEmpty,
    isEmail
}