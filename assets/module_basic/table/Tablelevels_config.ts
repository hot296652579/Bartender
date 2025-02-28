
import { JsonUtil } from "db://assets/core_tgx/base/utils/JsonUtil";

export class Tablelevels_config {
    static TableName: string = "levels_config";

    private data: any;

    init(id: number) {
        const table = JsonUtil.get(Tablelevels_config.TableName);
        this.data = table[id];
        this.id = id;
    }

    /** 编号【KEY】 */
    id: number = 0;

    /** 关卡编号 */
    get level(): number {
        return this.data.level;
    }
    /** 关卡颜色数 */
    get color(): number {
        return this.data.color;
    }
    /** 调酒杯数量 */
    get wineglass(): any {
        return this.data.wineglass;
    }
    /** 调酒杯规则 */
    get wineglass_color(): any {
        return this.data.wineglass_color;
    }
    /** 原料杯规格刷新率 */
    get measuringcup(): any {
        return this.data.measuringcup;
    }
    /** 原料杯刷新依据数 */
    get measuringcup_number(): number {
        return this.data.measuringcup_number;
    }
    /** 原料杯颜色上限 */
    get measuringcup_color(): number {
        return this.data.measuringcup_color;
    }
    /** 问号水刷新率 */
    get query_probability(): number {
        return this.data.query_probability;
    }
    /** 问号水上限 */
    get query_ceiling(): number {
        return this.data.query_ceiling;
    }
    /** 冰冻水刷新率 */
    get ice_probability(): number {
        return this.data.ice_probability;
    }
    /** 冰冻水上限 */
    get ice_ceiling(): number {
        return this.data.ice_ceiling;
    }
    /** 冰冻水极限 */
    get ice_thelimit(): number {
        return this.data.ice_thelimit;
    }
    /** 万能水刷新率 */
    get change_ceiling(): number {
        return this.data.change_ceiling;
    }
    /** 万能水上限 */
    get change_thelimit(): number {
        return this.data.change_thelimit;
    }
    /** 是否参与随机 */
    get random(): number {
        return this.data.random;
    }
}
    