import {StatGenUiRenderLevelOneEntityBase} from "./statgen-ui-comp-levelone-entitybase.js";

export class StatGenUiRenderLevelOneClass extends StatGenUiRenderLevelOneEntityBase {
    _title = "Class";
    _titleShort = "Class";
    _propIxEntity = "common_ixClass";
    _propIxAbilityScoreSet = "common_ixAbilityScoreSetClass";
    _propData = "_classes";
    _propModalFilter = "_modalFilterClasses";
    _propIsPreview = "common_isPreviewClass";
    _propEntity = "class";
    _page = UrlUtil.PG_CLASSES;
    _propChoiceMetasFrom = "common_classChoiceMetasFrom";
    _propChoiceWeighted = "common_classChoiceMetasWeighted";

    render() {
        const out = super.render();

        // Add any additional controls or hooks specific to classes here if needed
        return out;
    }

    _pb_getAbilityList() {
        return this._parent._pb_getClassAbilityList();
    }

    _pb_getAbility() {
        return this._parent._pb_getClassAbility();
    }

    _bindAdditionalHooks_hkIxEntity(hkIxEntity) {
        this._parent._addHookBase("common_isTashas", hkIxEntity);
        this._parent._addHookBase("common_isAllowTashasRules", hkIxEntity);
    }

    _bindAdditionalHooks_hkSetValuesSelAbilitySet(hkSetValuesSelAbilitySet) {
        this._parent._addHookBase("common_isTashas", hkSetValuesSelAbilitySet);
        this._parent._addHookBase("common_isAllowTashasRules", hkSetValuesSelAbilitySet);
    }

    _getHrPreviewMeta() {
        const out = super._getHrPreviewMeta();
        const {hkPreview} = out;
        this._parent._addHookBase("common_isShowTashasRules", hkPreview);
        this._parent._addHookBase("common_isAllowTashasRules", hkPreview);
        return out;
    }

    _getHkPreview({$hrPreview}) {
        return () => $hrPreview.toggleVe(this._parent._state[this._propIsPreview]);
    }
}