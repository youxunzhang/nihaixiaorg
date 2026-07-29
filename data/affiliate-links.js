/*
 * 医书联盟链接配置。
 * 将 url 留空时，跳转页会提示“购买渠道整理中”；配置后会显示前往按钮。
 * merchant 用于向读者说明将要前往的平台。
 */
const BOOK_STORE_URL = 'https://u.jd.com/UGL1Zyo';
const BOOK_STORE = '京东';

window.BOOK_AFFILIATE_LINKS = {
    'huangdi-neijing': { title: '《黄帝内经》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'shanghan-lun': { title: '《伤寒论》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'jingui-yaolue': { title: '《金匮要略》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'shennong-bencao': { title: '《神农本草经》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'zhenjiu-jiayijing': { title: '《针灸甲乙经》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'zhenjiu-dacheng': { title: '《针灸大成》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'bencao-gangmu': { title: '《本草纲目》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'wenbing-tiaobian': { title: '《温病条辨》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'wenre-lun': { title: '《温热论》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'yixue-sanzijing': { title: '《医学三字经》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'binhu-maixue': { title: '《濒湖脉学》', merchant: BOOK_STORE, url: BOOK_STORE_URL },
    'yangsheng-siyao': { title: '《养生四要》', merchant: BOOK_STORE, url: BOOK_STORE_URL }
};
