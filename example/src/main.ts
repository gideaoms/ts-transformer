export function sayHello({ name as string }) {
  return `Hello ${name}`
}

console.log(sayHello({ name: "John" }))