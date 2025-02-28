import { Button, Component, Label, Node, NodeEventType, _decorator, find } from 'cc';
import { GameEvent } from '../Enum/GameEvent';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GlobalConfig } from 'db://assets/start/Config/GlobalConfig';
import { AdvertMgr } from 'db://assets/core_tgx/base/ad/AdvertMgr';
import { TYPE_ITEM } from '../TakeGobletGlobalInstance';
import { tgxUIAlert } from 'db://assets/core_tgx/tgx';
const { ccclass, property } = _decorator;

/**
 * 底部按钮控制器
 */
@ccclass('ButtonComponent')
export class ButtonComponent extends Component {
    @property(Button) btnFillUp: Button = null!;
    @property(Button) btMoveOut: Button = null!;
    @property(Button) btRefresh: Button = null!;

    protected start(): void {
        this.addUIEvent();
    }

    private addUIEvent(): void {
        this.btnFillUp.node.on(NodeEventType.TOUCH_END, () => this.onClickHandler(TYPE_ITEM.FillUp), this);
        this.btMoveOut.node.on(NodeEventType.TOUCH_END, () => this.onClickHandler(TYPE_ITEM.MoveOut), this);
        this.btRefresh.node.on(NodeEventType.TOUCH_END, () => this.onClickHandler(TYPE_ITEM.Refresh), this);
    }

    private onClickHandler(type: TYPE_ITEM): void {
        // CarUnscrewAudioMgr.playOneShot(CarUnscrewAudioMgr.getMusicIdName(3), 1.0);
        let alerType = '';
        switch (type) {
            case TYPE_ITEM.FillUp:
                alerType = 'FillUp';
                break;
            case TYPE_ITEM.MoveOut:
                alerType = 'Remove';
                break;
            case TYPE_ITEM.Refresh:
                alerType = 'Refresh';
                break;
        }

        const options = tgxUIAlert.show("", alerType, true);
        options.onClick((ok: boolean) => {
            if (ok) {
                if (type == TYPE_ITEM.FillUp) {
                    if (!GlobalConfig.isDebug) {
                        AdvertMgr.instance.showReawardVideo(() => {
                            EventDispatcher.instance.emit(GameEvent.EVENT_FILL_UP);
                        })
                    } else {
                        EventDispatcher.instance.emit(GameEvent.EVENT_FILL_UP);
                    }
                } else if (type == TYPE_ITEM.MoveOut) {
                    if (!GlobalConfig.isDebug) {
                        AdvertMgr.instance.showReawardVideo(() => {
                            EventDispatcher.instance.emit(GameEvent.EVENT_MOVE_OUT);
                        })
                    } else {
                        EventDispatcher.instance.emit(GameEvent.EVENT_MOVE_OUT);
                    }
                } else {
                    if (!GlobalConfig.isDebug) {
                        AdvertMgr.instance.showReawardVideo(() => {
                            EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_COLOR);
                        })
                    } else {
                        EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_COLOR);
                    }
                }
            }
        })
    }

}
