(function () {
    const meridians = [
        { id: 'all', name: '全部经络', color: '#255f49' },
        { id: 'LU', name: '手太阴肺经', color: '#8c9ca7' },
        { id: 'LI', name: '手阳明大肠经', color: '#b09b69' },
        { id: 'ST', name: '足阳明胃经', color: '#ca913a' },
        { id: 'SP', name: '足太阴脾经', color: '#a87536' },
        { id: 'HT', name: '手少阴心经', color: '#b64539' },
        { id: 'SI', name: '手太阳小肠经', color: '#d06a47' },
        { id: 'BL', name: '足太阳膀胱经', color: '#3c78a0' },
        { id: 'KI', name: '足少阴肾经', color: '#3e597a' },
        { id: 'PC', name: '手厥阴心包经', color: '#9a4f69' },
        { id: 'TE', name: '手少阳三焦经', color: '#775f91' },
        { id: 'GB', name: '足少阳胆经', color: '#56805a' },
        { id: 'LR', name: '足厥阴肝经', color: '#3d714d' },
        { id: 'REN', name: '任脉', color: '#b03e35' },
        { id: 'DU', name: '督脉', color: '#4d4b45' }
    ];

    const paths = {
        LU: [[-.22,.26,.48],[-.38,.31,.40],[-.58,.43,.16],[-.78,.56,.05],[-.90,.67,.12]],
        LI: [[-.92,.70,.02],[-.76,.57,-.04],[-.57,.43,.12],[-.38,.29,.28],[-.24,.18,.38],[-.12,.11,.45]],
        ST: [[-.10,.13,.52],[-.16,.24,.52],[-.18,.40,.52],[-.28,.55,.43],[-.30,.74,.36],[-.28,.92,.25]],
        SP: [[-.16,.91,.28],[-.18,.74,.32],[-.13,.57,.40],[-.10,.44,.48],[-.12,.31,.48]],
        HT: [[.12,.28,.49],[.30,.32,.38],[.53,.44,.14],[.74,.57,.04],[.88,.68,.10]],
        SI: [[.90,.70,-.04],[.74,.57,-.16],[.52,.43,-.30],[.34,.28,-.48],[.15,.17,-.50]],
        BL: [[-.08,.12,-.54],[-.13,.27,-.54],[-.16,.43,-.53],[-.22,.57,-.48],[-.25,.75,-.40],[-.27,.93,-.24]],
        KI: [[.13,.94,.26],[.15,.76,.31],[.12,.59,.39],[.10,.44,.48],[.08,.30,.49]],
        PC: [[.04,.27,.53],[.24,.33,.42],[.47,.45,.16],[.68,.58,.06],[.84,.69,.12]],
        TE: [[.88,.68,-.08],[.70,.56,-.17],[.49,.42,-.30],[.31,.26,-.44],[.14,.12,-.49]],
        GB: [[.18,.10,.22],[.32,.22,.08],[.38,.39,.02],[.41,.54,.04],[.43,.72,.06],[.40,.91,.12]],
        LR: [[.19,.91,.26],[.18,.75,.33],[.12,.58,.43],[.08,.43,.49],[.10,.34,.51]],
        REN: [[0,.12,.56],[0,.23,.57],[0,.35,.58],[0,.48,.57],[0,.58,.49]],
        DU: [[0,.08,-.56],[0,.20,-.57],[0,.34,-.58],[0,.48,-.56],[0,.58,-.48]]
    };

    const points = [
        { code:'LU1', name:'中府', meridian:'LU', x:-.22,y:.26,z:.48, location:'胸前壁外上方，锁骨下区域。', note:'肺经起始区域的代表穴位，模型仅示意大致位置。' },
        { code:'LU9', name:'太渊', meridian:'LU', x:-.82,y:.62,z:.10, location:'腕掌侧横纹桡侧附近。', note:'肺经原穴，精确定位需结合解剖标志。' },
        { code:'LI4', name:'合谷', meridian:'LI', x:-.90,y:.69,z:.02, location:'手背第一、二掌骨之间区域。', note:'常见代表穴，孕期及特殊情况应由专业人员判断。' },
        { code:'LI11', name:'曲池', meridian:'LI', x:-.58,y:.43,z:.14, location:'屈肘时肘横纹外侧端附近。', note:'大肠经合穴，图示不替代规范取穴。' },
        { code:'ST25', name:'天枢', meridian:'ST', x:-.18,y:.40,z:.52, location:'腹部，脐旁区域。', note:'左右对称分布，本模型展示一侧。' },
        { code:'ST36', name:'足三里', meridian:'ST', x:-.30,y:.68,z:.38, location:'小腿前外侧，膝下区域。', note:'定位需结合犊鼻穴及胫骨前缘等标志。' },
        { code:'SP6', name:'三阴交', meridian:'SP', x:-.17,y:.76,z:.31, location:'小腿内侧，内踝尖上方区域。', note:'三条足阴经交会的代表穴，勿自行针刺。' },
        { code:'SP10', name:'血海', meridian:'SP', x:-.15,y:.58,z:.39, location:'大腿内侧、膝上区域。', note:'模型用于帮助理解经络分布方向。' },
        { code:'HT7', name:'神门', meridian:'HT', x:.78,y:.62,z:.08, location:'腕掌侧横纹尺侧附近。', note:'心经原穴，体表定位需专业指导。' },
        { code:'HT3', name:'少海', meridian:'HT', x:.54,y:.43,z:.14, location:'屈肘时肘横纹内侧区域。', note:'心经合穴的示意位置。' },
        { code:'SI3', name:'后溪', meridian:'SI', x:.89,y:.69,z:-.04, location:'手掌尺侧、第五掌指关节后方区域。', note:'小肠经代表穴，图示不作操作依据。' },
        { code:'SI11', name:'天宗', meridian:'SI', x:.24,y:.25,z:-.51, location:'肩胛区，肩胛骨冈下窝区域。', note:'背面查看更清晰。' },
        { code:'BL23', name:'肾俞', meridian:'BL', x:-.16,y:.42,z:-.54, location:'腰背部，第二腰椎棘突旁开区域。', note:'膀胱经背俞穴，精确定位需专业训练。' },
        { code:'BL40', name:'委中', meridian:'BL', x:-.24,y:.65,z:-.43, location:'膝后区，腘横纹中点附近。', note:'背面模型中的代表穴位。' },
        { code:'KI3', name:'太溪', meridian:'KI', x:.14,y:.88,z:.24, location:'足内侧，内踝与跟腱之间区域。', note:'肾经原穴，模型为大致示意。' },
        { code:'KI6', name:'照海', meridian:'KI', x:.15,y:.92,z:.23, location:'足内侧，内踝尖下方区域。', note:'需结合骨性标志规范定位。' },
        { code:'PC6', name:'内关', meridian:'PC', x:.68,y:.58,z:.08, location:'前臂掌侧，腕横纹上方区域。', note:'心包经络穴，图示不替代专业取穴。' },
        { code:'PC8', name:'劳宫', meridian:'PC', x:.88,y:.70,z:.13, location:'掌心区域。', note:'心包经荥穴的示意位置。' },
        { code:'TE5', name:'外关', meridian:'TE', x:.69,y:.57,z:-.16, location:'前臂背侧，腕背横纹上方区域。', note:'三焦经络穴，旋转至侧背面查看。' },
        { code:'TE14', name:'肩髎', meridian:'TE', x:.34,y:.27,z:-.42, location:'肩部，肩峰后下方区域。', note:'肩部穴位结构复杂，应由专业人员定位。' },
        { code:'GB20', name:'风池', meridian:'GB', x:.18,y:.12,z:-.35, location:'颈后，枕骨下两侧凹陷区域。', note:'头颈部穴位不可自行针刺。' },
        { code:'GB34', name:'阳陵泉', meridian:'GB', x:.42,y:.66,z:.05, location:'小腿外侧，腓骨小头前下方区域。', note:'胆经合穴的示意位置。' },
        { code:'LR3', name:'太冲', meridian:'LR', x:.19,y:.92,z:.26, location:'足背第一、二跖骨之间区域。', note:'肝经原穴，模型不显示足部精细结构。' },
        { code:'LR8', name:'曲泉', meridian:'LR', x:.16,y:.63,z:.38, location:'膝内侧，膝横纹内侧端附近。', note:'体表定位需结合膝部解剖标志。' },
        { code:'CV6', name:'气海', meridian:'REN', x:0,y:.46,z:.58, location:'下腹部前正中线，脐下区域。', note:'任脉代表穴，模型仅示意相对位置。' },
        { code:'CV17', name:'膻中', meridian:'REN', x:0,y:.27,z:.57, location:'前胸正中线，平第四肋间区域。', note:'胸部穴位定位应结合肋间标志。' },
        { code:'GV14', name:'大椎', meridian:'DU', x:0,y:.20,z:-.57, location:'后正中线，第七颈椎棘突下区域。', note:'督脉代表穴，背面查看更清晰。' },
        { code:'GV20', name:'百会', meridian:'DU', x:0,y:.045,z:-.12, location:'头顶正中区域。', note:'头部示意点，不作为针刺定位依据。' }
    ];

    const canvas = document.getElementById('meridianCanvas');
    const panel = document.getElementById('canvasPanel');
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let zoom = 1;
    let activeMeridian = 'all';
    let dragging = false;
    let lastX = 0;
    let renderedPoints = [];

    function colorFor(id) { return meridians.find((item) => item.id === id)?.color || '#255f49'; }
    function nameFor(id) { return meridians.find((item) => item.id === id)?.name || id; }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
    }

    function project(point) {
        const rad = angle * Math.PI / 180;
        const rotatedX = point[0] * Math.cos(rad) + point[2] * Math.sin(rad);
        const depth = point[2] * Math.cos(rad) - point[0] * Math.sin(rad);
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width * .43 * zoom;
        const scaleY = rect.height * .88 * zoom;
        return { x: rect.width / 2 + rotatedX * scaleX, y: rect.height * .06 + point[1] * scaleY, depth };
    }

    function drawBody() {
        const rect = canvas.getBoundingClientRect();
        const rad = angle * Math.PI / 180;
        const turn = Math.abs(Math.cos(rad));
        const scaleX = rect.width * .43 * zoom;
        const scaleY = rect.height * .88 * zoom;
        const cx = rect.width / 2;
        const top = rect.height * .06;
        const bodyWidth = scaleX * (.30 + turn * .28);
        ctx.save();
        ctx.fillStyle = '#eadcc8';
        ctx.strokeStyle = '#bfae97';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, top + scaleY * .075, scaleX * .13 * (.62 + turn * .38), scaleY * .055, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - bodyWidth * .44, top + scaleY * .16);
        ctx.bezierCurveTo(cx - bodyWidth * 1.55, top + scaleY * .20, cx - bodyWidth * 1.35, top + scaleY * .48, cx - bodyWidth * 1.05, top + scaleY * .54);
        ctx.lineTo(cx - bodyWidth * .58, top + scaleY * .58);
        ctx.lineTo(cx - bodyWidth * .34, top + scaleY * .95);
        ctx.lineTo(cx - bodyWidth * .04, top + scaleY * .95);
        ctx.lineTo(cx, top + scaleY * .59);
        ctx.lineTo(cx + bodyWidth * .04, top + scaleY * .95);
        ctx.lineTo(cx + bodyWidth * .34, top + scaleY * .95);
        ctx.lineTo(cx + bodyWidth * .58, top + scaleY * .58);
        ctx.lineTo(cx + bodyWidth * 1.05, top + scaleY * .54);
        ctx.bezierCurveTo(cx + bodyWidth * 1.35, top + scaleY * .48, cx + bodyWidth * 1.55, top + scaleY * .20, cx + bodyWidth * .44, top + scaleY * .16);
        ctx.bezierCurveTo(cx + bodyWidth * .28, top + scaleY * .14, cx + bodyWidth * .22, top + scaleY * .13, cx + bodyWidth * .18, top + scaleY * .13);
        ctx.lineTo(cx + bodyWidth * .22, top + scaleY * .50);
        ctx.lineTo(cx - bodyWidth * .22, top + scaleY * .50);
        ctx.lineTo(cx - bodyWidth * .18, top + scaleY * .13);
        ctx.bezierCurveTo(cx - bodyWidth * .22, top + scaleY * .13, cx - bodyWidth * .28, top + scaleY * .14, cx - bodyWidth * .44, top + scaleY * .16);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(112,83,53,.06)';
        ctx.fillRect(cx - 1, top + scaleY * .14, 2, scaleY * .82);
        ctx.restore();
    }

    function drawMeridians() {
        Object.entries(paths).forEach(([id, path]) => {
            if (activeMeridian !== 'all' && activeMeridian !== id) return;
            const projected = path.map(project);
            ctx.save();
            ctx.beginPath();
            projected.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
            ctx.strokeStyle = colorFor(id);
            ctx.globalAlpha = activeMeridian === id ? 1 : .76;
            ctx.lineWidth = activeMeridian === id ? 4 : 2.2;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.shadowColor = 'rgba(255,255,255,.7)'; ctx.shadowBlur = 2;
            ctx.stroke(); ctx.restore();
        });
    }

    function drawPoints() {
        renderedPoints = [];
        points.forEach((point) => {
            if (activeMeridian !== 'all' && activeMeridian !== point.meridian) return;
            const pos = project([point.x, point.y, point.z]);
            const radius = activeMeridian === point.meridian ? 6 : 4.5;
            ctx.save();
            ctx.globalAlpha = Math.max(.35, .75 + pos.depth * .45);
            ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = colorFor(point.meridian); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            if (activeMeridian !== 'all') {
                ctx.globalAlpha = 1; ctx.fillStyle = '#26372e'; ctx.font = '12px sans-serif';
                ctx.fillText(point.name, pos.x + 9, pos.y + 4);
            }
            ctx.restore();
            renderedPoints.push({ ...pos, radius: 12, data: point });
        });
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        const gradient = ctx.createRadialGradient(rect.width/2, rect.height*.43, 20, rect.width/2, rect.height*.43, rect.height*.52);
        gradient.addColorStop(0, 'rgba(255,255,255,.9)'); gradient.addColorStop(1, 'rgba(225,219,205,.35)');
        ctx.fillStyle = gradient; ctx.fillRect(0,0,rect.width,rect.height);
        drawBody(); drawMeridians(); drawPoints();
        const normalized = ((angle % 360) + 360) % 360;
        const view = normalized < 45 || normalized >= 315 ? '正面' : normalized < 135 ? '右侧' : normalized < 225 ? '背面' : '左侧';
        document.getElementById('viewBadge').textContent = `${view} · ${Math.round(normalized)}°`;
    }

    function selectPoint(point) {
        document.getElementById('pointEmpty').hidden = true;
        const detail = document.getElementById('pointDetail');
        detail.hidden = false;
        detail.style.setProperty('--point-color', colorFor(point.meridian));
        document.getElementById('pointCode').textContent = point.code;
        document.getElementById('pointName').textContent = point.name;
        document.getElementById('pointMeridian').textContent = nameFor(point.meridian);
        document.getElementById('pointLocation').textContent = point.location;
        document.getElementById('pointNote').textContent = point.note;
    }

    function buildFilters() {
        const list = document.getElementById('meridianList');
        meridians.forEach((meridian) => {
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'meridian-filter';
            button.classList.toggle('active', meridian.id === 'all');
            button.style.setProperty('--line-color', meridian.color);
            button.innerHTML = `<i></i><span>${meridian.name}</span>`;
            button.addEventListener('click', () => {
                activeMeridian = meridian.id;
                document.querySelectorAll('.meridian-filter').forEach((item) => item.classList.toggle('active', item === button));
                draw();
            });
            list.appendChild(button);
        });
    }

    panel.addEventListener('pointerdown', (event) => { dragging = true; lastX = event.clientX; panel.classList.add('dragging'); panel.setPointerCapture(event.pointerId); });
    panel.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        angle += (event.clientX - lastX) * .65; lastX = event.clientX; draw();
    });
    panel.addEventListener('pointerup', (event) => { dragging = false; panel.classList.remove('dragging'); panel.releasePointerCapture(event.pointerId); });
    panel.addEventListener('pointercancel', () => { dragging = false; panel.classList.remove('dragging'); });
    canvas.addEventListener('click', (event) => {
        if (Math.abs(event.movementX) > 3) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left; const y = event.clientY - rect.top;
        const nearest = renderedPoints.map((point) => ({ point, distance: Math.hypot(point.x - x, point.y - y) })).sort((a,b) => a.distance - b.distance)[0];
        if (nearest && nearest.distance <= nearest.point.radius) selectPoint(nearest.point.data);
    });
    panel.addEventListener('wheel', (event) => { event.preventDefault(); zoom = Math.min(1.35, Math.max(.72, zoom - event.deltaY * .001)); draw(); }, { passive: false });
    document.getElementById('zoomIn').addEventListener('click', () => { zoom = Math.min(1.35, zoom + .1); draw(); });
    document.getElementById('zoomOut').addEventListener('click', () => { zoom = Math.max(.72, zoom - .1); draw(); });
    document.getElementById('resetView').addEventListener('click', () => { angle = 0; zoom = 1; draw(); });
    document.querySelector('.tool-menu')?.addEventListener('click', (event) => {
        const links = document.getElementById('toolLinks'); const open = links.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(open));
    });
    buildFilters(); resize(); window.addEventListener('resize', resize);
})();
