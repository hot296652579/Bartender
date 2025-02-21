import { _decorator, CCInteger, Component, Enum, Node, tween, Vec3 } from 'cc';
import { CupHeight } from '../TakeGobletGlobalInstance';
import { LevelAction } from '../LevelAction';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property, executeInEditMode } = _decorator;

/** 原浆酒杯组件脚本*/
@ccclass('OriginCup')
@executeInEditMode
export class OriginCup extends Component {
    @property({ type: Enum(CupHeight), displayName: '杯高度' })
    cupHeight: CupHeight = CupHeight.Two

    @property(Node)
    waters: Node = null!;  //水节点

    start() {
        this.node.on(Node.EventType.TOUCH_END, () => {
            // EventDispatcher.instance.emit(GameEvent.EVENT_CLICK_ORIGIN_CUP, this);
        });
    }

    update(deltaTime: number) {

    }

    destroyOriginCup() {
        const id = this.node.uuid;
        console.log('销毁原浆杯id : ', id);
        tween(this.node)
            .to(0.3, { scale: Vec3.ZERO })
            .call(() => {
                EventDispatcher.instance.emit(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, id);
                this.node.destroy();
            })
            .start();
    }
}


