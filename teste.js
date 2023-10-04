function isPrime(number) {
    if (number <= 1) {

        return false;
    }
    for (let i = 2; i < ((number / 2) + 1); i++) {
        if (number % i === 0) {
            return false;
        }
    }
    return true;
}
const numbersToCheck = [2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Números primos:");
for (const number of numbersToCheck) {
    if (isPrime(number)) {
        console.log(number);
    }
}