import { _decorator, Component, Enum, Node } from 'cc';
import { CupHeight, WaterColors } from '../TakeGobletGlobalInstance';
import { Water } from './Water';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('TempCup')
export class TempCup extends Component {

    @property({ type: Enum(CupHeight), displayName: '杯高度' })
    cupHeight: CupHeight = CupHeight.One

    @property(Node)
    waters: Node = null!;  //水节点

    @property(Node)
    adNode: Node = null!;

    private _currentColor: WaterColors = WaterColors.Blue;
    private _isFull: boolean = false;

    get isFull(): boolean {
        return this._isFull;
    }

    get currentColor(): WaterColors {
        return this._currentColor;
    }

    get iconAd(): boolean {
        return this.adNode.active;
    }

    start() {
        this.node.on(Node.EventType.TOUCH_END, () => {
            this.onTouchEndAdCup();
        });
    }

    private onTouchEndAdCup() {
        if (this.iconAd) {
            this.adNode.active = false;
            console.log('关闭广告图标@@@@@');
        }
    }

    fill(color: WaterColors) {
        if (this._isFull) return;

        const waterNode = this.waters.children[0];
        if (waterNode) {
            const water = waterNode.getComponent(Water)!;
            water.color = color;
            waterNode.active = true;
            this._currentColor = color;
            this._isFull = true;
        }
    }

    reset() {
        this.waters.children[0].active = false;
        this._isFull = false;
        console.log('暂存杯已重置');
    }

    public getColors(): WaterColors[] {
        return this.waters.children
            .filter(node => node.active)
            .map(node => node.getComponent(Water)!.color);
    }

    public getActiveWaters(): Water[] {
        return this.waters.children
            .filter(node => node.active)
            .map(node => node.getComponent(Water)!);
    }

    public isEmpty(): boolean {
        return this.waters.children.every(node => !node.active);
    }
}


