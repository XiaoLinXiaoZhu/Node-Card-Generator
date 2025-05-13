import { FunctionChain,type FnCall } from "../lib/FunctionChain";

const chain = new FunctionChain<FnCall>();
chain.add({ fn: () => console.log("1") })
    .add({ fn: () => console.log("2") })
    .add({ fn: () => console.log("3") })
    .add({ fn: () => console.log("4") })
    .add({ fn: () => console.log("5") })
    .remove(3)
    .run().then(() => {
        console.log("done");
    });

const chain2 = new FunctionChain<FnCall>();


let str = {
    value : "test"
}
chain2.add({ fn: (str: any) => str.value += "1" })
    .add({ fn: (str: any) => str.value += "2" })
    .add({ fn: (str: any) => str.value += "3" })
    .add({ fn: (str: any) => str.value += "4" })
    .add({ fn: (str: any) => str.value += "5" })
    .remove(3)
    .run(str).then(() => {
        console.log(str.value); // test12345
    })
