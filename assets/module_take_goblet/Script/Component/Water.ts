import { _decorator, BoxCollider2D, Button, CircleCollider2D, Collider2D, Color, Component, Enum, find, Node, NodeEventType, sp, Sprite } from 'cc';
import { WaterColorHex, WaterColors } from '../TakeGobletGlobalInstance';
import { OriginCupState } from './OriginCup';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Water')
@executeInEditMode
export class Water extends Component {
    private _color: WaterColors = WaterColors.Blue;
    skeleton: sp.Skeleton = null!;

    @property(Sprite)
    sprite: Sprite = null!;

    @property({ type: Enum(WaterColors) })
    get color() {
        return this._color;
    }

    set color(value: WaterColors) {
        this._color = value;
        this.updateColor();
    }

    private updateColor() {
        let color = new Color(WaterColorHex[this.color]);
        const target = this.skeleton ?? this.sprite;
        if (target) {
            target.color = color;
        }
    }

    start() {
        this.skeleton = this.node.getComponent(sp.Skeleton)!;
        this.sprite = this.node.getChildByName('Sprite')?.getComponent(Sprite)!;
        this.updateColor();
    }

    initColor(color: WaterColors) {
        this._color = color;
        this.updateColor();
    }

    //播放动画根据状态
    playAnimation(state: OriginCupState, index?: number) {
        switch (state) {
            case OriginCupState.Up:
                this.playUpAnimation();
                break;
            case OriginCupState.PourWater:
                this.playPourWaterAnimation(index);
                break;
            default:
                break;
        }
    }

    playUpAnimation() {
        if (!this.skeleton) return;
        this.skeleton.setAnimation(0, 'pour_idle', false);
    }

    playPourWaterAnimation(index: number) {
        if (!this.skeleton) return;

        console.log(`动画名:pour_0${index} -- index:${index}`);
        this.skeleton.setAnimation(0, `pour_0${index}`, false);
    }
}

