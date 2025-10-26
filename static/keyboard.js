(function(){
    // --- Sélection robuste de l'input ---
    const input = document.getElementById('termInput') || document.querySelector('input[name="term"], textarea[name="term"]');
    const vk    = document.getElementById('vk');
    const toggle= document.getElementById('vkToggle');

    if(!input || !vk || !toggle){
        console.error('[VK] Élément manquant (input/vk/toggle). Vérifie les IDs dans index.html.');
        return;
    }

    // --- Disposition du clavier : Kurmanji latin ---
    const rowsLower = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m'],
        ['ç','ê','î','ş','û']
    ];
    const toUpperMap = { 'ç':'Ç','ê':'Ê','î':'Î','ş':'Ş','û':'Û' };
    const rowsUpper = rowsLower.map(row => row.map(ch => toUpperMap[ch] || ch.toUpperCase()));

    let isUpper = false;

    function buildKeys(){
        [...vk.querySelectorAll('.vk-row')].forEach(el => el.remove());
        const layout = isUpper ? rowsUpper : rowsLower;
        layout.forEach(row=>{
            const rowEl = document.createElement('div');
            rowEl.className = 'vk-row';
            row.forEach(key=>{
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'vk-key';
                btn.textContent = key;
                btn.dataset.char = key;
                btn.addEventListener('pointerdown', (e)=>{
                    e.preventDefault();
                    insertChar(key);
                });
                rowEl.appendChild(btn);
            });
            vk.appendChild(rowEl);
        });
    }

    function insertChar(text){
        if(document.activeElement !== input){
            input.focus({ preventScroll: true });
        }
        const start = input.selectionStart ?? input.value.length;
        const end   = input.selectionEnd ?? input.value.length;
        if (typeof input.setRangeText === 'function'){
            input.setRangeText(text, start, end, 'end');
        } else {
            const before = input.value.slice(0, start);
            const after  = input.value.slice(end);
            input.value = before + text + after;
            const pos = start + text.length;
            if (typeof input.setSelectionRange === 'function'){
                input.setSelectionRange(pos, pos);
            }
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function backspace(){
        if(document.activeElement !== input){
            input.focus({ preventScroll: true });
        }
        const start = input.selectionStart ?? input.value.length;
        const end   = input.selectionEnd ?? input.value.length;
        if (start === end && start > 0){
            input.setRangeText('', start-1, end, 'end');
        } else if (start !== end){
            input.setRangeText('', start, end, 'end');
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const space = () => insertChar(' ');
    function clearField(){
        input.value = '';
        if (typeof input.setSelectionRange === 'function'){
            input.setSelectionRange(0, 0);
        }
        input.focus({ preventScroll: true });
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    vk.querySelectorAll('.vk-key[data-action]').forEach(btn=>{
        btn.addEventListener('pointerdown', (e)=>{
            e.preventDefault();
            const action = btn.dataset.action;
            if(action === 'backspace') return backspace();
            if(action === 'space')     return space();
            if(action === 'clear')     return clearField();
            if(action === 'upper'){
                isUpper = !isUpper;
                buildKeys();
            }
        });
    });

    toggle.addEventListener('click', ()=>{
        const open = vk.style.display === 'flex';
        if(open){
            vk.style.display = 'none';
            toggle.setAttribute('aria-expanded','false');
            toggle.setAttribute('aria-pressed','false');
        } else {
            vk.style.display = 'flex';
            toggle.setAttribute('aria-expanded','true');
            toggle.setAttribute('aria-pressed','true');
            buildKeys();
        }
        input.focus({ preventScroll: true });
    });

    document.querySelector('form')?.addEventListener('submit', ()=>{
        vk.style.display = 'none';
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-pressed','false');
    });

    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && vk.style.display === 'flex'){
            vk.style.display = 'none';
            toggle.setAttribute('aria-expanded','false');
            toggle.setAttribute('aria-pressed','false');
        }
    });
})();
