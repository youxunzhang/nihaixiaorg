const herbRecords = [
    {
        slug: 'renshen',
        name: '人参',
        pinyin: 'Rén Shēn',
        aliases: [],
        type: '根及根茎',
        latin: 'Panax ginseng C. A. Mey.',
        origin: '五加科植物人参的干燥根和根茎。',
        appearance: '主根多呈纺锤形或圆柱形，表面灰黄色，可见纵皱纹；上端常连接根茎，细根上有时可见小突起。',
        harvest: '通常在秋季采挖，除去泥土后按不同加工方式干燥，形成不同商品规格。',
        classic: '本站《神农本草经》名称资料将“人参”列入草部上品索引。',
        classicUrl: '/guji/shennong-bencao/shangpin/renshen/'
    },
    {
        slug: 'huangqi',
        name: '黄芪',
        pinyin: 'Huáng Qí',
        aliases: ['黄耆'],
        type: '根及根茎',
        latin: 'Astragalus membranaceus (Fisch.) Bge. var. mongholicus 或 A. membranaceus',
        origin: '豆科植物蒙古黄芪或膜荚黄芪的干燥根。',
        appearance: '多呈圆柱形，表面淡棕黄色至淡棕褐色，可见纵皱纹；断面常显纤维性，并有放射状纹理。',
        harvest: '多在春、秋两季采挖，除去须根和根头后干燥。',
        classic: '古籍与研究资料中常见“黄耆”字形，本站目录保留“黄芪／黄耆”的检索关系。',
        classicUrl: '/guji/shennong-bencao/shangpin/huangqi/'
    },
    {
        slug: 'danggui',
        name: '当归',
        pinyin: 'Dāng Guī',
        aliases: ['秦归'],
        type: '根及根茎',
        latin: 'Angelica sinensis (Oliv.) Diels',
        origin: '伞形科植物当归的干燥根。',
        appearance: '根头略膨大，主根较短，下部常分出多条支根；表面黄棕色至棕褐色，并有纵皱纹。',
        harvest: '一般在秋末采挖，除去泥土和须根，待水分散失后整理、干燥。',
        classic: '本站《神农本草经》名称资料保留“当归”的目录位置和版本线索。',
        classicUrl: '/guji/shennong-bencao/shangpin/danggui/'
    },
    {
        slug: 'baishao',
        name: '白芍',
        pinyin: 'Bái Sháo',
        aliases: ['白芍药'],
        type: '根及根茎',
        latin: 'Paeonia lactiflora Pall.',
        origin: '毛茛科植物芍药的干燥根。',
        appearance: '多呈圆柱形，表面类白色或淡棕红色，较为平滑；断面平坦，颜色偏白或微带棕色。',
        harvest: '多在夏、秋两季采挖，经修整、煮制、去皮或干燥等步骤形成常见药材规格。',
        classic: '古籍目录中宜同时检索“芍药”与“白芍药”等名称，不把古今名称简单等同。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'chuanxiong',
        name: '川芎',
        pinyin: 'Chuān Xiōng',
        aliases: ['芎䓖'],
        type: '根及根茎',
        latin: 'Ligusticum chuanxiong Hort.',
        origin: '伞形科植物川芎的干燥根茎。',
        appearance: '整体呈不规则结节状拳形团块，表面黄褐色，可见隆起的轮节；断面黄白或灰黄色。',
        harvest: '通常在栽培茎节明显时采挖，除去泥土和茎叶后干燥。',
        classic: '“川芎”和古籍常见写法“芎䓖”存在名称沿革，查目录时可并行检索。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'danshen',
        name: '丹参',
        pinyin: 'Dān Shēn',
        aliases: ['紫丹参'],
        type: '根及根茎',
        latin: 'Salvia miltiorrhiza Bge.',
        origin: '唇形科植物丹参的干燥根和根茎。',
        appearance: '根多呈长圆柱形，表面棕红色或暗棕红色，有纵皱纹；老根外皮有时呈鳞片状剥落。',
        harvest: '多在春、秋两季采挖，除去泥沙后干燥。',
        classic: '丹参可从本站《神农本草经》总目录继续核对名称与分部线索。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'fuling',
        name: '茯苓',
        pinyin: 'Fú Líng',
        aliases: ['云苓'],
        type: '菌核',
        latin: 'Poria cocos (Schw.) Wolf',
        origin: '多孔菌科真菌茯苓的干燥菌核。',
        appearance: '完整菌核多为不规则块状，外皮灰褐至黑褐色并有皱缩；内部通常为白色，少数略带粉红。',
        harvest: '采挖后常经反复堆置与干燥，使内部水分逐步散失，再按规格切制。',
        classic: '本站目录按所据版本保留“茯苓”的古籍分部位置，并注明古籍分类与现代分类不同。',
        classicUrl: '/guji/shennong-bencao/shangpin/fuling/'
    },
    {
        slug: 'baizhu',
        name: '白术',
        pinyin: 'Bái Zhú',
        aliases: ['于术'],
        type: '根及根茎',
        latin: 'Atractylodes macrocephala Koidz.',
        origin: '菊科植物白术的干燥根茎。',
        appearance: '多为不规则肥厚团块，表面灰黄或灰棕色，常见瘤状突起和须根痕；断面黄白至淡棕色。',
        harvest: '一般在冬季茎叶枯萎后采挖，除去泥沙和地上部分后干燥。',
        classic: '古籍中的“术”可能涉及名称与品种沿革，不能不加区分地直接等同于今天的白术。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'gancao',
        name: '甘草',
        pinyin: 'Gān Cǎo',
        aliases: ['甜草'],
        type: '根及根茎',
        latin: 'Glycyrrhiza uralensis Fisch.、G. inflata Bat. 或 G. glabra L.',
        origin: '豆科植物甘草、胀果甘草或光果甘草的干燥根和根茎。',
        appearance: '根多呈圆柱形，表面红棕或灰棕色，具纵皱纹和皮孔；断面常见明显的放射状纹理。',
        harvest: '多在春、秋两季采挖，除去须根后晒干，之后可按需要切制。',
        classic: '本站《神农本草经》名称资料提供“甘草”的目录位置、异名线索与版本说明。',
        classicUrl: '/guji/shennong-bencao/shangpin/gancao/'
    },
    {
        slug: 'chenpi',
        name: '陈皮',
        pinyin: 'Chén Pí',
        aliases: ['橘皮'],
        type: '果皮',
        latin: 'Citrus reticulata Blanco 及其栽培变种',
        origin: '芸香科植物橘及其栽培变种的干燥成熟果皮。',
        appearance: '常剥成数瓣，外表面橙红或红棕色，可见点状油室；内表面淡黄白色，呈海绵状。',
        harvest: '果实成熟后剥取果皮，清理后晒干或低温干燥；产地和加工方式会形成不同商品规格。',
        classic: '查古籍时可同时留意“橘皮”“橘柚”等名称，但不同文献中的对应关系仍需逐条核对。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'banxia',
        name: '半夏',
        pinyin: 'Bàn Xià',
        aliases: [],
        type: '根及根茎',
        latin: 'Pinellia ternata (Thunb.) Breit.',
        origin: '天南星科植物半夏的干燥块茎。',
        appearance: '多呈类球形，表面白色或淡黄色，顶端常见凹陷的茎痕，周围有细小根痕。',
        harvest: '多在夏、秋两季采挖，除去外皮和须根后干燥；不同炮制品不能仅凭名称互相替代。',
        classic: '半夏具有明确的原料与炮制安全边界，本页仅用于名称和形态学习，不能据此自行处理或使用。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'chaihu',
        name: '柴胡',
        pinyin: 'Chái Hú',
        aliases: ['北柴胡', '南柴胡（商品称谓）'],
        type: '根及根茎',
        latin: 'Bupleurum chinense DC. 或 B. scorzonerifolium Willd.',
        origin: '伞形科植物柴胡或狭叶柴胡的干燥根。',
        appearance: '根多呈圆柱形或长圆锥形，根头略膨大；表面黑褐或浅棕色，并有纵皱纹和支根痕。',
        harvest: '一般在春、秋两季采挖，除去地上部分和泥沙后干燥。',
        classic: '不同基原和商品称谓需结合来源核对，不能只凭“北”“南”字样判断。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'huanglian',
        name: '黄连',
        pinyin: 'Huáng Lián',
        aliases: ['川连'],
        type: '根及根茎',
        latin: 'Coptis chinensis Franch.、C. deltoidea C. Y. Cheng et Hsiao 或 C. teeta Wall.',
        origin: '毛茛科植物黄连、三角叶黄连或云连的干燥根茎。',
        appearance: '根茎多分枝，形似簇状或鸡爪状，表面灰黄或黄褐色；断面木部常呈鲜黄色或橙黄色。',
        harvest: '多在秋季采挖，除去须根和泥沙后干燥，并按不同基原和形态分级。',
        classic: '本站《神农本草经》名称资料保留“黄连”的古籍目录位置与版本来源。',
        classicUrl: '/guji/shennong-bencao/shangpin/huanglian/'
    },
    {
        slug: 'jinyinhua',
        name: '金银花',
        pinyin: 'Jīn Yín Huā',
        aliases: ['忍冬花'],
        type: '花类',
        latin: 'Lonicera japonica Thunb.',
        origin: '忍冬科植物忍冬的干燥花蕾或带初开的花。',
        appearance: '花蕾多呈棒状，上粗下细，略弯曲；表面黄白、绿白或淡黄色，可见短柔毛。',
        harvest: '在花开放前或初开时分批采收，及时通风干燥，以保留花蕾形态。',
        classic: '“金银花”和“忍冬花”反映了名称沿革，查古籍时宜结合年代和具体条文判断。',
        classicUrl: '/guji/shennong-bencao/'
    },
    {
        slug: 'gouqizi',
        name: '枸杞子',
        pinyin: 'Gǒu Qǐ Zǐ',
        aliases: ['枸杞'],
        type: '果实种子',
        latin: 'Lycium barbarum L.',
        origin: '茄科植物宁夏枸杞的干燥成熟果实。',
        appearance: '果实呈类纺锤形或椭圆形，表面红色或暗红色并有皱纹，内部可见多枚扁肾形种子。',
        harvest: '夏、秋果实成熟时分批采收，先使果皮略皱，再逐步干燥。',
        classic: '古籍中的“枸杞”可能指植物不同部位；现代“枸杞子”强调的是干燥成熟果实。',
        classicUrl: '/guji/shennong-bencao/'
    }
];

const typeColors = {
    '根及根茎': '#2f7256',
    '花类': '#a54f64',
    '果实种子': '#b55239',
    '果皮': '#b5792e',
    '菌核': '#7e6844'
};

const grid = document.querySelector('#herbGrid');
const search = document.querySelector('#herbSearch');
const filters = document.querySelector('#herbFilters');
const resultCount = document.querySelector('#herbResultCount');
const emptyState = document.querySelector('#herbEmpty');
const dialog = document.querySelector('#herbDialog');
const dialogContent = document.querySelector('#herbDialogContent');
const dialogClose = document.querySelector('#herbDialogClose');
let activeFilter = '全部';

function normalized(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();
}

function getFilteredRecords() {
    const query = normalized(search?.value);
    return herbRecords.filter(record => {
        const matchesType = activeFilter === '全部' || record.type === activeFilter;
        const haystack = normalized([record.name, record.pinyin, ...record.aliases, record.origin].join(' '));
        return matchesType && (!query || haystack.includes(query));
    });
}

function renderCards() {
    const records = getFilteredRecords();
    resultCount.textContent = `共 ${records.length} 份药材名称档案`;
    emptyState.hidden = records.length > 0;
    grid.hidden = records.length === 0;
    grid.innerHTML = records.map(record => {
        const color = typeColors[record.type] || typeColors['根及根茎'];
        const aliases = record.aliases.length ? `别名：${record.aliases.join('、')}` : '名称以常用正名为主';
        return `
            <button class="herb-card" type="button" data-herb="${record.slug}" style="--herb-accent: ${color}" aria-label="查看${record.name}名称档案">
                <span class="herb-card-mark" aria-hidden="true">${record.name.slice(0, 1)}</span>
                <span>
                    <span class="herb-card-head">
                        <span><h3>${record.name}</h3><span class="herb-pinyin">${record.pinyin}</span></span>
                        <span class="herb-part">${record.type}</span>
                    </span>
                    <span class="herb-origin">${record.origin}</span>
                    <span class="herb-alias">${aliases}</span>
                </span>
                <span class="herb-card-arrow" aria-hidden="true">↗</span>
            </button>
        `;
    }).join('');
}

function renderDialog(record) {
    const color = typeColors[record.type] || typeColors['根及根茎'];
    const aliases = record.aliases.length ? record.aliases.join('、') : '暂无统一常用别名';
    dialog.style.setProperty('--dialog-accent', color);
    dialogContent.innerHTML = `
        <header class="herb-dialog-hero">
            <span class="herb-dialog-mark" aria-hidden="true">${record.name.slice(0, 1)}</span>
            <div>
                <p class="herb-dialog-kicker">药材名称档案 · ${record.type}</p>
                <h2 id="herbDialogTitle">${record.name}</h2>
                <span class="herb-pinyin">${record.pinyin}</span>
            </div>
        </header>
        <div class="herb-dialog-body">
            <dl class="herb-facts">
                <div><dt>常用别名</dt><dd>${aliases}</dd></div>
                <div><dt>药材部位</dt><dd>${record.type}</dd></div>
                <div><dt>拉丁学名</dt><dd>${record.latin}</dd></div>
            </dl>
            <section class="herb-detail-section"><h3>基原与部位</h3><p>${record.origin}</p></section>
            <section class="herb-detail-section"><h3>形态辨识</h3><p>${record.appearance}</p></section>
            <section class="herb-detail-section"><h3>采收加工线索</h3><p>${record.harvest}</p></section>
            <section class="herb-detail-section"><h3>典籍与名称线索</h3><p>${record.classic} <a href="${record.classicUrl}">继续查考古籍目录 →</a></p></section>
            <aside class="herb-dialog-note">仅作名称、基原与形态学习。中药材存在混淆品、炮制品和来源差异，不要据此自行鉴定、采集、加工或使用。</aside>
        </div>
    `;
}

function setHerbInUrl(slug) {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set('herb', slug);
    else url.searchParams.delete('herb');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function openHerb(slug, updateUrl = true) {
    const record = herbRecords.find(item => item.slug === slug);
    if (!record) return;
    renderDialog(record);
    if (updateUrl) setHerbInUrl(slug);
    if (!dialog.open) dialog.showModal();
}

function closeHerb(updateUrl = true) {
    if (dialog.open) dialog.close();
    if (updateUrl) setHerbInUrl('');
}

grid.addEventListener('click', event => {
    const card = event.target.closest('[data-herb]');
    if (card) openHerb(card.dataset.herb);
});

search.addEventListener('input', renderCards);
filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    renderCards();
});

dialogClose.addEventListener('click', () => closeHerb());
dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) closeHerb();
});
dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeHerb();
});

const menuButton = document.querySelector('.tool-menu');
const menuLinks = document.querySelector('#toolLinks');
menuButton?.addEventListener('click', () => {
    const open = menuLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
});

renderCards();
const initialHerb = new URLSearchParams(window.location.search).get('herb');
if (initialHerb) openHerb(initialHerb, false);
