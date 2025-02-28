import { _decorator, Component, Node } from 'cc';
import { OriginCup } from './OriginCup';
import { Water } from './Water';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('OriginArea')
export class OriginArea extends Component {
    start() {
        this.registerListener();
    }

    registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, this.unfreezeCup, this);
    }

    protected onDestroy(): void {
        this.unregisterListener();
    }

    unregisterListener() {
        EventDispatcher.instance.off(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, this.unfreezeCup, this);
    }

    /** 获取所有原浆杯水节点的mark数量*/
    public getTotalMarkCount(): number {
        let count = 0;
        this.node.children.forEach(originCupNode => {
            const originCup = originCupNode.getComponent(OriginCup);
            if (originCup) {
                originCup.marks.children.forEach(markNode => {
                    if (markNode.active) {
                        count++;
                    }
                });
            }
        });
        return count;
    }

    /** 获取冰冻杯数量*/
    public getFrozenCupCount(): number {
        let count = 0;
        this.node.children.forEach(originCupNode => {
            const originCup = originCupNode.getComponent(OriginCup);
            if (originCup) {
                if (originCup.freezeActive) {
                    count++;
                }
            }
        });
        return count;
    }

    //解冻冰冻水杯
    private unfreezeCup() {
        this.node.children.forEach(originCupNode => {
            const originCup = originCupNode.getComponent(OriginCup);
            if (originCup) {
                if (originCup.freezeActive) {
                    originCup.unFreeze();
                }
            }
        });
    }
}


