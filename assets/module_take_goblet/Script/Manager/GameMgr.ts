import { Node, Prefab, _decorator, assetManager, find, instantiate, sys } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager {
    private static _instance: GameManager | null = null;
    public static get instance(): GameManager {
        if (!this._instance) this._instance = new GameManager();
        return this._instance;
    }
}
