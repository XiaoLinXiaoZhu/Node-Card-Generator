import type { CardEffect, CardElement } from "../nodes/cardLibs";
import { functionChain,type fnCall } from "./functionChain";
import CardInstance from "../nodes/CardInstance.vue";

interface SketchPadFn extends fnCall{
    type : "Element" | "CardEffect" | "PixelEffect"
    fn: (env: SketchPadOptions) => void
}

// 这个是到时候传递给 run 的参数
interface SketchPadOptions{
    width: number,
    height: number,
    cardInstance: InstanceType<typeof CardInstance>,
    tempCtx: CanvasRenderingContext2D,
}

class SketchPad extends functionChain<SketchPadFn>{
    addElement(el : CardElement){
        this.then((env: SketchPadOptions) => {
            // 这里是添加元素的逻辑
            console.log("添加元素", el);
            env.cardInstance.elements.push(el);
        });
    }

    addCardEffect(cardEffect: CardEffect){
        // 这种cardEffect 本质上是一个父元素，将所有的子元素都添加到这个父元素上
        this.then((env: SketchPadOptions) => {
            // 这里是添加元素的逻辑
            console.log("添加卡片特效", cardEffect);
            env.cardInstance.cardEffects.push(cardEffect);
        });
    }
}