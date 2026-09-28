class MultiSelect {
    constructor(selectEl, options = {}) {
        this.select = selectEl;
        this.placeholder = options.placeholder || '-- Chọn --';
        this.selected = new Set();
        this.options = Array.from(selectEl.options).map(o => ({
            value: o.value, label: o.text, MaHang: o.dataset.mahang || '', TenHang: o.dataset.tenhang || '', TenCL: o.dataset.tencl || '', TenDVCL: o.dataset.tendvcl || '', MaLenh: o.dataset.malenh
        }));

        this._build();
    }

    _build() {
        this.select.style.display = 'none';

        // Wrapper chỉ chứa trigger
        const wrapper = document.createElement('div');
        wrapper.className = 'ms-wrapper';
        wrapper.innerHTML = `
        <div class="ms-trigger">
            <div class="ms-tags"></div>
            <span class="ms-arrow"></span>
            <span>▾</span>
        </div>
    `;
        this.select.parentNode.insertBefore(wrapper, this.select.nextSibling);

        // Dropdown render thẳng vào body
        const dropdown = document.createElement('div');
        dropdown.className = 'ms-dropdown';
        dropdown.innerHTML = `
        <div class="ms-search-wrap">
            <input class="ms-search" placeholder="Tìm kiếm..." />
        </div>
        <div class="ms-actions">
            <button class="ms-all-btn">Chọn tất cả</button>
            <button class="ms-none-btn">Bỏ chọn</button>
        </div>
        <div class="ms-list"></div>
    `;
        //document.body.appendChild(dropdown); 

        this._getDropdownParent().appendChild(dropdown);
        this.wrapper = wrapper;
        this.trigger = wrapper.querySelector('.ms-trigger');
        this.tags = wrapper.querySelector('.ms-tags');
        //this.countEl = wrapper.querySelector('.ms-count');
        this.arrowEl = wrapper.querySelector('.ms-arrow');
        this.dropdown = dropdown;
        this.searchEl = dropdown.querySelector('.ms-search');
        this.listEl = dropdown.querySelector('.ms-list');
        this.filtered = [...this.options];

        this._bindEvents();
        this._renderList();
        this._renderTags();
    }
    _bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.dropdown.classList.contains('open')) {
                this.dropdown.classList.remove('open');
            } else {
                this._openDropdown();
            }
        });

        // Dùng mousedown thay vì click để không conflict với item selection
        document.addEventListener('mousedown', (e) => {
            if (!this.wrapper.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.dropdown.classList.remove('open');
            }
        });

        // Item click không dùng event bubble lên document
        this.searchEl.addEventListener('input', () => {
            const q = this.searchEl.value.toLowerCase();
            this.filtered = this.options.filter(o => o.label.toLowerCase().includes(q));
            this._renderList();
        });

        this.dropdown.querySelector('.ms-all-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.filtered.forEach(o => this.selected.add(o.value));
            this._renderList(); this._renderTags(); this._syncSelect();
        });

        this.dropdown.querySelector('.ms-none-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.filtered.forEach(o => this.selected.delete(o.value));
            this._renderList(); this._renderTags(); this._syncSelect();
        });
    }

    _renderList() {
        if (this.filtered.length === 0) {
            this.listEl.innerHTML = '<div class="ms-empty">Không tìm thấy</div>';
            return;
        }
        this.listEl.innerHTML = this.filtered.map(o => `
        <div class="ms-item ${this.selected.has(o.value) ? 'selected' : ''}" data-val="${o.value}">
            <input type="checkbox" id="chk-${o.value}" ${this.selected.has(o.value) ? 'checked' : ''} />
            <label for="chk-${o.value}">${o.label}</label>
        </div>
    `).join('');

        this.listEl.querySelectorAll('.ms-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();      // ngăn trigger mất focus
                e.stopPropagation();     // ngăn event bubble lên document
                const v = item.dataset.val;
                if (this.selected.has(v)) this.selected.delete(v);
                else this.selected.add(v);
                this._renderList();
                this._renderTags();
                this._syncSelect();
                // KHÔNG đóng dropdown sau khi chọn
            });
        });
    }



    //render
    _renderTags() {
        const sel = this.options.filter(o => this.selected.has(o.value));

        this.tags.innerHTML = '';

        if (sel.length === 0) {
            this.tags.innerHTML = `<span class="ms-placeholder">${this.placeholder}</span>`;
            return;
        }

        // Tạm render tất cả để đo độ rộng
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.whiteSpace = 'nowrap';
        temp.style.left = '-9999px';
        temp.style.top = '-9999px';
        document.body.appendChild(temp);

        const getTagHTML = (o) => `
        <span class="ms-tag" title="${o.label}">
            <span class="ms-tag-label">${o.label}</span>
            <span class="ms-tag-x" data-val="${o.value}">×</span>
        </span>
    `;

        const moreHTML = `<span class="ms-tag-more">...</span>`;

        // Đo tổng width khả dụng
        const availableWidth = this.tags.clientWidth;

        let rendered = '';
        let usedWidth = 0;
        let count = 0;

        for (let i = 0; i < sel.length; i++) {
            const o = sel[i];
            temp.innerHTML = getTagHTML(o);
            const tagWidth = temp.firstElementChild.getBoundingClientRect().width;

            // đo width của ... nếu cần
            let moreWidth = 0;
            if (i < sel.length - 1) {
                temp.innerHTML = moreHTML;
                moreWidth = temp.firstElementChild.getBoundingClientRect().width;
            }

            // nếu thêm tag này mà vượt quá, dừng và thêm ...
            if (usedWidth + tagWidth + (i < sel.length - 1 ? moreWidth : 0) > availableWidth) {
                if (count === 0) {
                    // Nếu 1 tag đầu tiên đã quá dài, vẫn cố hiển thị nó ở dạng rút gọn
                    rendered += getTagHTML(o);
                } else if (i < sel.length) {
                    rendered += moreHTML;
                }
                break;
            }

            rendered += getTagHTML(o);
            usedWidth += tagWidth;
            count++;
        }

        temp.remove();
        this.tags.innerHTML = rendered;

        this.tags.querySelectorAll('.ms-tag-x').forEach(x => {
            x.addEventListener('click', e => {
                e.stopPropagation();
                this.selected.delete(x.dataset.val);
                this._renderList();
                this._renderTags();
                this._syncSelect();
            });
        });
    }


    _syncSelect() {
        Array.from(this.select.options).forEach(o => {
            o.selected = this.selected.has(o.value);
        });
    }

    // Lấy danh sách value đã chọn
    getValues() {
        return [...this.selected];
    }
    // show lên chỉnh lại tọa độ
    //_openDropdown() {
    //    const rect = this.trigger.getBoundingClientRect();

    //    document.body.appendChild(this.dropdown);

    //    this.dropdown.style.position = 'fixed';
    //    this.dropdown.style.zIndex = '200000';

    //    this.dropdown.style.top = (rect.bottom + 4) + 'px';
    //    this.dropdown.style.left = rect.left + 'px';
    //    this.dropdown.style.width = rect.width + 'px';

    //    this.dropdown.classList.add('open');
    //    this.searchEl.focus();

    //}
    _openDropdown() {
        const rect = this.trigger.getBoundingClientRect();
        const parent = this._getDropdownParent();

        parent.appendChild(this.dropdown);

        this.dropdown.style.position = 'fixed';
        this.dropdown.style.zIndex = '200000';

        this.dropdown.style.top = (rect.bottom + 4) + 'px';
        this.dropdown.style.left = rect.left + 'px';
        this.dropdown.style.width = rect.width + 'px';

        this.dropdown.classList.add('open');

        setTimeout(() => {
            this.searchEl.focus();
        }, 0);
    }
    destroy() {
        // Xóa dropdown khỏi body
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }

        // Xóa wrapper khỏi DOM
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }

        // Hiện lại select gốc nếu cần
        if (this.select) {
            this.select.style.display = '';
        }

        // Xóa tham chiếu
        this.dropdown = null;
        this.wrapper = null;
        this.trigger = null;
        this.tags = null;
        this.searchEl = null;
        this.listEl = null;
    }
    _getDropdownParent() {
        return this.select.closest('.modal') || document.body;
    }
    getMaHangValue() {
        return this.options
            .filter(o => this.selected.has(o.value))
            .map(o => `${o.MaHang},${o.TenHang},${o.MaLenh}`)
            .join('; ');
    }
    getTenCLValue() {
        return this.options
            .filter(o => this.selected.has(o.value))
            .map(o => `${o.MaHang},${o.TenCL},${o.TenDVCL}`)
            .join('; ');
    }
    reset() {
        // Xóa toàn bộ item đang chọn
        this.selected.clear();

        // Clear search nếu đang có nhập tìm kiếm
        if (this.searchEl) {
            this.searchEl.value = "";
        }

        // Reset danh sách filter về full options
        this.filtered = [...this.options];

        // Render lại giao diện
        this._renderList();
        this._renderTags();

        // Sync lại select gốc
        this._syncSelect();

        // Đóng dropdown nếu đang mở
        if (this.dropdown) {
            this.dropdown.classList.remove("open");
        }
    }
}