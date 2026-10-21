const chapters = [
    { order:1, title:'针灸是什么', subtitle:'从砭石、针具到针灸经典', keywords:'历史 针具 艾灸 经典', points:['“针灸”通常合称针法与灸法，是传统医学历史中的重要技术体系。','学习时应区分历史文献、理论概念与现代临床规范；古籍记载不能直接转换为自行操作步骤。'], links:[['查看《黄帝内经》总目录','/guji/huangdi-neijing/']] },
    { order:2, title:'经络体系总览', subtitle:'十二经脉、奇经八脉与络脉', keywords:'十二经脉 奇经八脉 络脉 经络', points:['经络是传统医学描述人体联系与运行关系的一套理论语言。','入门可先记住十二经脉名称，再认识任脉、督脉等概念，最后结合古籍篇章理解语境。'], links:[['打开经络穴位模型','acupoints.html']] },
    { order:3, title:'腧穴名称与编码', subtitle:'先会查名称，再理解分类', keywords:'腧穴 穴位 编码 原穴 络穴', points:['现代资料常用经脉英文缩写与序号帮助检索，例如 LU、LI、ST 等；中文名称仍应与可靠版本对照。','穴位模型只展示代表点的大致区域，不提供精确定位或针刺方法。'], links:[['查看模型中的代表穴位','acupoints.html']] },
    { order:4, title:'五输穴的概念', subtitle:'井、荥、输、经、合的分类框架', keywords:'五输穴 井 荥 输 经 合', points:['五输穴是特定腧穴分类名称，包括井、荥、输、经、合。','本章帮助辨认术语及其在古籍中的位置，不提供针对个人症状的配穴和操作建议。'], links:[['检索《素问》目录','/guji/huangdi-neijing/suwen/']] },
    { order:5, title:'常见特定穴分类', subtitle:'原穴、络穴、募穴与背俞穴', keywords:'原穴 络穴 募穴 背俞穴 特定穴', points:['原穴、络穴、募穴、背俞穴等是针灸学习中常见的分类词汇。','遇到同名异写、定位差异或版本差异时，应核对教材、标准和原始文献，不依赖单一网页。'], links:[['查看经脉名称速览','#meridianTitle']] },
    { order:6, title:'针灸古籍怎么读', subtitle:'从篇名、版本与来源开始', keywords:'黄帝内经 素问 灵枢 古籍 原文 版本', points:['先用目录定位主题，再进入正文核对上下文；注意古籍版本、异体字和后世注解之间的区别。','本站古籍页保留来源与审核状态，适合用作继续阅读的入口。'], links:[['读《素问》目录','/guji/huangdi-neijing/suwen/'],['读《灵枢》目录','/guji/huangdi-neijing/lingshu/']] }
];

const meridians = [
    ['LU','手太阴肺经'],['LI','手阳明大肠经'],['ST','足阳明胃经'],['SP','足太阴脾经'],
    ['HT','手少阴心经'],['SI','手太阳小肠经'],['BL','足太阳膀胱经'],['KI','足少阴肾经'],
    ['PC','手厥阴心包经'],['TE','手少阳三焦经'],['GB','足少阳胆经'],['LR','足厥阴肝经'],
    ['REN','任脉'],['DU','督脉']
];

const chapterList = document.querySelector('#chapterList');
const chapterSearch = document.querySelector('#chapterSearch');
const chapterCount = document.querySelector('#chapterCount');
const chapterEmpty = document.querySelector('#chapterEmpty');
const chapterDialog = document.querySelector('#chapterDialog');
const dialogContent = document.querySelector('#dialogContent');

function renderChapters() {
    const query = chapterSearch.value.trim().toLowerCase();
    const filtered = chapters.filter((chapter) => `${chapter.title}${chapter.subtitle}${chapter.keywords}`.toLowerCase().includes(query));
    chapterCount.textContent = `共 ${filtered.length} 章`;
    chapterEmpty.hidden = filtered.length > 0;
    chapterList.hidden = filtered.length === 0;
    chapterList.replaceChildren(...filtered.map((chapter) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'acu-chapter-button';
        button.dataset.order = chapter.order;
        button.setAttribute('aria-label', `打开第${chapter.order}章：${chapter.title}`);
        button.innerHTML = `<span>${String(chapter.order).padStart(2,'0')}</span><div><strong>${chapter.title}</strong><small>${chapter.subtitle}</small></div><span aria-hidden="true">→</span>`;
        return button;
    }));
}

function openChapter(order) {
    const chapter = chapters.find((item) => item.order === order);
    if (!chapter) return;
    dialogContent.replaceChildren();
    const hero = document.createElement('header');
    hero.className = 'acu-dialog-hero';
    hero.innerHTML = `<span>CHAPTER ${String(chapter.order).padStart(2,'0')}</span><h2 id="dialogTitle">${chapter.title}</h2><p>${chapter.subtitle}</p>`;
    const body = document.createElement('div');
    body.className = 'acu-dialog-body';
    const heading = document.createElement('h3');
    heading.textContent = '学习要点';
    body.append(heading);
    chapter.points.forEach((text) => { const p=document.createElement('p'); p.textContent=text; body.append(p); });
    const links = document.createElement('div');
    links.className = 'acu-dialog-links';
    chapter.links.forEach(([label,href]) => { const link=document.createElement('a'); link.href=href; link.textContent=`${label} →`; links.append(link); });
    body.append(links);
    dialogContent.append(hero,body);
    chapterDialog.showModal();
}

document.querySelector('#meridianBoard').replaceChildren(...meridians.map(([code,name]) => {
    const item=document.createElement('span');
    item.innerHTML=`<strong>${name}</strong><b>${code}</b>`;
    return item;
}));

chapterSearch.addEventListener('input',renderChapters);
chapterList.addEventListener('click',(event)=>{const button=event.target.closest('[data-order]');if(button)openChapter(Number(button.dataset.order));});
document.querySelector('#dialogClose').addEventListener('click',()=>chapterDialog.close());
chapterDialog.addEventListener('click',(event)=>{const rect=chapterDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)chapterDialog.close();});

const menuButton=document.querySelector('.tool-menu');
const menuLinks=document.querySelector('#toolLinks');
menuButton?.addEventListener('click',()=>{const open=menuLinks.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});

renderChapters();
