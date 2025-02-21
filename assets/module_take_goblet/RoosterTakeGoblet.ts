import { _decorator, Component, ERaycast2DType, find, Label, Node, NodeEventType, PhysicsSystem2D, Tween, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { TakeGobletGlobalInstance } from './Script/TakeGobletGlobalInstance';
import { GameEvent } from './Script/Enum/GameEvent';
import { LevelManager } from './Script/Manager/LevelMgr';
import { GameUtil } from './Script/GameUtil';

import { tgxUIMgr } from '../core_tgx/tgx';
import { UI_Setting } from '../scripts/UIDef';
import { TakeGobletAudioMgr } from './Script/Manager/TakeGobletAudioMgr';
const { ccclass, property } = _decorator;

const duration = 0.3;
@ccclass('RoosterTakeGoblet')
export class RoosterTakeGoblet extends Component {

    onLoad() {
        TakeGobletAudioMgr.initilize();
        // TakeGobletAudioMgr.play(TakeGobletAudioMgr.getMusicIdName(2), 1.0);

        LevelManager.instance.initilizeModel();
        TakeGobletGlobalInstance.instance.levels = find('Canvas/Scene/Levels')!;

        this.registerListener();
    }

    protected start(): void {
        this.startGame();
    }

    async startGame() {
        await LevelManager.instance.gameStart();
    }

    registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.onUpdateLvl, this);
        const btnRefresh = find('Canvas/GameUI/TopLeft/BtnRefresh')!;
        const btnSet = find('Canvas/GameUI/TopLeft/BtnSet')!;
        btnRefresh.on(NodeEventType.TOUCH_END, () => this.onClickRefresh(), this);
        btnSet.on(NodeEventType.TOUCH_END, () => this.onClickSet(), this);
    }

    private async onClickRefresh(): Promise<void> {
        TakeGobletAudioMgr.playOneShot(TakeGobletAudioMgr.getMusicIdName(3), 1.0);
        Tween.stopAll();
        EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
    }

    private onClickSet(): void {
        TakeGobletAudioMgr.playOneShot(TakeGobletAudioMgr.getMusicIdName(3), 1.0);
        const show = tgxUIMgr.inst.isShowing(UI_Setting);
        if (!show) {
            tgxUIMgr.inst.showUI(UI_Setting);
        }
    }

    onUpdateLvl() {
        const lbScrews = find('Canvas/GameUI/TitleLvl/LbLvl')!.getComponent(Label);

        const { level } = LevelManager.instance.levelModel;
        lbScrews.string = `Level:${level}`;
    }
}




