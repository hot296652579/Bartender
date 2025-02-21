import { _decorator, Component, Node } from 'cc';
import { OriginCup } from './OriginCup';
import { Water } from './Water';
const { ccclass, property } = _decorator;

@ccclass('OriginArea')
export class OriginArea extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    //获取所有原浆杯水节点的mark数量
    public getTotalMarkCount(): number {
        let count = 0;
        this.node.children.forEach(originCupNode => {
            const originCup = originCupNode.getComponent(OriginCup);
            if (originCup) {
                originCup.waters.children.forEach(waterNode => {
                    const water = waterNode.getComponent(Water);
                    if (water?.markActive) {
                        count++;
                    }
                });
            }
        });
        return count;
    }
}


