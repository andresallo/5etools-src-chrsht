export class StatGenUtilAdditionalClasses {
    static getSelIxSetMeta({ comp, prop, available }) {
        const $sel = $(`<select class="form-control input-xs"></select>`)
            .append(available.map((it, i) => `<option value="${i}">${it.name}</option>`))
            .change(() => comp.state[prop] = Number($sel.val()));

        const unhook = comp.addHookBase(prop, () => $sel.val(comp.state[prop] || 0));
        $sel.val(comp.state[prop] || 0);

        return { $sel, unhook };
    }

    static getUidsStatic(classSet) {
        return classSet?.static || [];
    }
}