// 1. Mathematical
var sum_to_n_a = function(n) {
    return n * (n + 1) / 2;
};

// 2. Iterative
var sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// 3. Recursive
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};

// Test cases
console.log("Testing sum_to_n(5):");
console.log("Implementation A:", sum_to_n_a(5)); // Expected: 15
console.log("Implementation B:", sum_to_n_b(5)); // Expected: 15
console.log("Implementation C:", sum_to_n_c(5)); // Expected: 15

console.log("\nTesting sum_to_n(10):");
console.log("Implementation A:", sum_to_n_a(10)); // Expected: 55
console.log("Implementation B:", sum_to_n_b(10)); // Expected: 55
console.log("Implementation C:", sum_to_n_c(10)); // Expected: 55

console.log("\nTesting sum_to_n(0):");
console.log("Implementation A:", sum_to_n_a(0)); // Expected: 0
console.log("Implementation B:", sum_to_n_b(0)); // Expected: 0
console.log("Implementation C:", sum_to_n_c(0)); // Expected: 0