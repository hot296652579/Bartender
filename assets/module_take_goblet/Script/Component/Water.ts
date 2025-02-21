import { _decorator, BoxCollider2D, Button, CircleCollider2D, Collider2D, Color, Component, Enum, find, Node, NodeEventType, Sprite } from 'cc';
import { WaterColorHex, WaterColors } from '../TakeGobletGlobalInstance';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Water')
@executeInEditMode
export class Water extends Component {
    private _color: WaterColors = WaterColors.Blue;

    @property({ type: Enum(WaterColors) })
    get color() {
        return this._color;
    }

    set color(value: WaterColors) {
        this._color = value;
        this.updateColor();
    }

    @property(Sprite)
    private sprite: Sprite = null!;

    @property(Node)
    private mark: Node = null!;
    get markActive() {
        return this.mark.active;
    }

    private updateColor() {
        if (this.sprite) {
            this.sprite.color = new Color(WaterColorHex[this._color]);
        }
    }

    start() {
        this.updateColor();
    }

    initColor(color: WaterColors) {
        this._color = color;
        this.updateColor();
    }

    setMark(mark: boolean) {
        this.mark.active = mark;
    }
}

